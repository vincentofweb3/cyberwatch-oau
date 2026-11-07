import { createHash } from "node:crypto";
import { headers } from "next/headers";

export async function getRequestFingerprint(scope: string) {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headerStore.get("x-real-ip") || "local";
  const salt = process.env.SESSION_SECRET || "cyberwatch-development-fingerprint";

  return createHash("sha256").update(`${scope}:${ip}:${salt}`).digest("hex");
}
