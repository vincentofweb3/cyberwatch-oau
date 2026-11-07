import { afterEach, describe, expect, it, vi } from "vitest";
import { readNotificationConfig, reportEmail } from "@/lib/notifications/message";
import { sendResendEmail } from "@/lib/notifications/resend";
import { validCronAuthorization } from "@/lib/notifications/cron-auth";

const environment = {
  REPORT_NOTIFICATIONS_ENABLED: "true",
  RESEND_API_KEY: "test-only-key",
  REPORT_NOTIFICATION_TO: "analyst@example.test",
  APP_ORIGIN: "https://cyberwatch.example.test",
};
afterEach(() => vi.unstubAllGlobals());

describe("Email configuration and transport", () => {
  it("requires an explicit opt-in and rejects unsafe recipients, senders, and dashboard origins", () => {
    expect(readNotificationConfig({})).toBeNull();
    expect(readNotificationConfig(environment)?.from).toContain("onboarding@resend.dev");
    for (const override of [
      { REPORT_NOTIFICATION_TO: "one@example.test,two@example.test" },
      { REPORT_NOTIFICATION_FROM: "CyberWatch\r\nBcc: other@example.test" },
      { APP_ORIGIN: "https://user:secret@example.test" },
      { APP_ORIGIN: "http://public.example.test" },
      { APP_ORIGIN: "https://example.test/redirect?to=other" },
    ])
      expect(() => readNotificationConfig({ ...environment, ...override })).toThrow();
  });

  it("uses a fixed endpoint, bearer key, and idempotency header and sanitizes errors", async () => {
    const message = reportEmail(readNotificationConfig(environment)!, {
      id: "report-id",
      referenceCode: "CW-2026-ABCDEFG",
      category: "PHISHING",
      severity: "LOW",
      createdAt: new Date(),
    });
    const request = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ id: "provider-id" }))
      .mockResolvedValueOnce(Response.json({ message: "PRIVATE RESPONSE BODY" }, { status: 403 }))
      .mockResolvedValueOnce(Response.json({ message: "PRIVATE RESPONSE BODY" }, { status: 429 }))
      .mockRejectedValueOnce(new Error("PRIVATE NETWORK ERROR"));
    vi.stubGlobal("fetch", request);
    expect(await sendResendEmail("test-key", message, "job-key")).toEqual({
      ok: true,
      id: "provider-id",
    });
    expect(request).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
          "Idempotency-Key": "job-key",
        }),
      }),
    );
    expect(await sendResendEmail("test-key", message, "job-key")).toEqual({
      ok: false,
      code: "resend_403",
      retryable: false,
    });
    expect(await sendResendEmail("test-key", message, "job-key")).toEqual({
      ok: false,
      code: "resend_429",
      retryable: true,
    });
    expect(await sendResendEmail("test-key", message, "job-key")).toEqual({
      ok: false,
      code: "network_or_timeout",
      retryable: true,
    });
  });

  it("requires the complete configured cron secret", () => {
    const secret = "a".repeat(40);
    expect(validCronAuthorization(`Bearer ${secret}`, secret)).toBe(true);
    expect(validCronAuthorization(null, secret)).toBe(false);
    expect(validCronAuthorization("Bearer undefined", undefined)).toBe(false);
    expect(validCronAuthorization("Bearer short", "short")).toBe(false);
    expect(validCronAuthorization(`Bearer ${"b".repeat(40)}`, secret)).toBe(false);
  });
});
