import type { EmailMessage } from "./message";

export type SendResult = { ok: true; id: string } | { ok: false; code: string; retryable: boolean };

export async function sendResendEmail(
  apiKey: string,
  message: EmailMessage,
  idempotencyKey: string,
): Promise<SendResult> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(message),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
      redirect: "error",
    });
    const data = await response.json().catch(() => null);
    if (response.ok && typeof data?.id === "string") return { ok: true, id: data.id };
    const conflict = response.status === 409 && data?.name === "concurrent_idempotent_requests";
    // Store a bounded error code, never Resend's response body or request credentials.
    return {
      ok: false,
      code: `resend_${response.status}`,
      retryable:
        response.ok ||
        response.status === 408 ||
        response.status === 429 ||
        response.status >= 500 ||
        conflict,
    };
  } catch {
    // A timeout may occur after acceptance. Retain the same key and payload.
    return { ok: false, code: "network_or_timeout", retryable: true };
  }
}
