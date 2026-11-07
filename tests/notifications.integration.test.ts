import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDatabase } from "./helpers/database";
import { processNotificationBatch } from "@/lib/notifications/worker";
import type { NotificationConfig } from "@/lib/notifications/message";
import type { sendResendEmail } from "@/lib/notifications/resend";

let database: Awaited<ReturnType<typeof createTestDatabase>>;
vi.mock("@/db/client", () => ({
  get db() {
    return database.db;
  },
}));
vi.mock("@/lib/dal/session", () => ({
  requireResponder: vi.fn(async () => ({})),
  getResponderForAction: vi.fn(async () => null),
}));
let incidents: typeof import("@/lib/dal/incidents");
let rateLimit: typeof import("@/lib/rate-limit");
const config: NotificationConfig = {
  apiKey: "test-key",
  from: "CyberWatch <onboarding@resend.dev>",
  to: "analyst@example.test",
  origin: "https://cyberwatch.example.test",
};
let time: Date;
const send = vi.fn<typeof sendResendEmail>();

beforeAll(async () => {
  database = await createTestDatabase();
  incidents = await import("@/lib/dal/incidents");
  rateLimit = await import("@/lib/rate-limit");
}, 60_000);
beforeEach(async () => {
  await database.query(
    "TRUNCATE report_notifications, rate_limits, audit_logs, incident_events, alerts, incidents, users",
  );
  time = new Date(Date.now() + 1000);
  send.mockReset().mockResolvedValue({ ok: true, id: "test-message-id" });
});
afterAll(async () => {
  await database?.close();
}, 30_000);

async function report() {
  const receipt = await incidents.createPublicIncident({
    category: "PHISHING",
    channel: "EMAIL",
    title: "Private title not for email",
    description: "Private incident narrative must remain inside the analyst workspace.",
    impact: "LOW",
    anonymous: false,
    reporterEmail: "private-reporter@example.test",
    consent: true,
  });
  // Anchor the fake worker clock to the stored schedule, not network round-trip time.
  const [job] = await database.query<{ next_attempt_at: Date }>(
    "SELECT next_attempt_at FROM report_notifications",
  );
  time = new Date(job.next_attempt_at.getTime() + 1);
  return receipt;
}
const run = (settings = config) => {
  const options = { send, now: () => time, limit: 1 };
  return database.kind === "postgres"
    ? processNotificationBatch(database.db, settings, options)
    : processNotificationBatch(database.db, settings, options);
};

describe("Durable email delivery", () => {
  it("queues exactly one job with the report and keeps email data out of public tracking", async () => {
    const receipt = await report();
    expect(await database.query("SELECT status, attempts FROM report_notifications")).toEqual([
      { status: "PENDING", attempts: 0 },
    ]);
    expect(
      await incidents.trackPublicIncident(receipt.referenceCode, receipt.trackingKey),
    ).not.toHaveProperty("notification");
    await expect(run()).resolves.toMatchObject({ accepted: 1 });
    const payload = send.mock.calls[0][1];
    expect(payload.to).toEqual([config.to]);
    expect(payload.text).toContain(receipt.referenceCode);
    for (const value of [
      receipt.trackingKey,
      "Private title",
      "Private incident narrative",
      "private-reporter@example.test",
    ])
      expect(JSON.stringify(payload)).not.toContain(value);
    await run();
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("rolls back the whole report when its notification cannot be recorded", async () => {
    await database.query(
      "ALTER TABLE report_notifications ADD CONSTRAINT reject_notification CHECK (status <> 'PENDING')",
    );
    try {
      await expect(report()).rejects.toThrow();
      expect(await database.query("SELECT id FROM incidents")).toHaveLength(0);
      expect(await database.query("SELECT id FROM incident_events")).toHaveLength(0);
    } finally {
      await database.query("ALTER TABLE report_notifications DROP CONSTRAINT reject_notification");
    }
  });

  it("retries a transient failure using identical content and key without duplicating the report", async () => {
    await report();
    send.mockResolvedValueOnce({ ok: false, code: "network_or_timeout", retryable: true });
    await expect(run()).resolves.toMatchObject({ retrying: 1 });
    await run();
    expect(send).toHaveBeenCalledTimes(1);
    time = new Date(time.getTime() + 61_000);
    await database.query("UPDATE incidents SET severity = 'CRITICAL'");
    await expect(
      run({ ...config, to: "changed@example.test", origin: "https://new.example.test" }),
    ).resolves.toMatchObject({ accepted: 1 });
    expect(send.mock.calls[0].slice(1)).toEqual(send.mock.calls[1].slice(1));
    expect(await database.query("SELECT id FROM incidents")).toHaveLength(1);
  });

  it("allows only one worker to send a claimed notification", async () => {
    await report();
    const outcomes = await Promise.all([run(), run()]);
    expect(outcomes.reduce((total, item) => total + item.accepted, 0)).toBe(1);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("recovers expired claims but stops uncertain retries before idempotency expires", async () => {
    await report();
    send.mockResolvedValueOnce({ ok: false, code: "network_or_timeout", retryable: true });
    await run();
    await database.query(
      "UPDATE report_notifications SET status = 'PROCESSING', locked_until = $1, lock_token = 'interrupted'",
      [new Date(time.getTime() - 1000)],
    );
    await expect(run()).resolves.toMatchObject({ accepted: 1 });
    await database.query(
      "UPDATE report_notifications SET status = 'PROCESSING', locked_until = $1, lock_token = 'interrupted', first_attempt_at = $2",
      [new Date(time.getTime() - 1000), new Date(time.getTime() - 23 * 60 * 60 * 1000)],
    );
    await expect(run()).resolves.toMatchObject({ review: 1 });
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("retains a saved report when Resend rejects delivery and does not repeatedly send", async () => {
    await report();
    send.mockResolvedValue({ ok: false, code: "resend_403", retryable: false });
    await expect(run()).resolves.toMatchObject({ failed: 1 });
    await run();
    expect(send).toHaveBeenCalledTimes(1);
    expect(await database.query("SELECT id FROM incidents")).toHaveLength(1);
  });

  it("enforces one shared rate limit across concurrent requests and resets expired windows", async () => {
    const results = await Promise.all(
      Array.from({ length: 7 }, () =>
        rateLimit.takeRateLimit("hashed-test-fingerprint", 5, 900_000),
      ),
    );
    expect(results.filter((result) => result.allowed)).toHaveLength(5);
    await database.query("UPDATE rate_limits SET reset_at = $1", [new Date(Date.now() - 1000)]);
    expect(await rateLimit.takeRateLimit("hashed-test-fingerprint", 5, 900_000)).toMatchObject({
      allowed: true,
      remaining: 4,
    });
  });

  it("rejects unauthenticated retry attempts before dispatch", async () => {
    const { retryReportNotification } = await import("@/lib/dal/notifications");
    await expect(retryReportNotification("90000000-0000-4000-8000-000000000001")).rejects.toThrow(
      "session has expired",
    );
    expect(send).not.toHaveBeenCalled();
  });
});
