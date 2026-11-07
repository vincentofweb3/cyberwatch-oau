import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { hash } from "bcryptjs";
import { createTestDatabase } from "./helpers/database";
import { users } from "@/db/schema";
import type { ReportIncidentInput } from "@/lib/validators";

const actor = {
  id: "90000000-0000-4000-8000-000000000001",
  fullName: "Test Analyst",
  email: "analyst@example.test",
  role: "ANALYST" as const,
};

let database: Awaited<ReturnType<typeof createTestDatabase>>;
vi.mock("@/db/client", () => ({
  get db() {
    return database.db;
  },
}));
vi.mock("@/lib/dal/session", () => ({
  getResponderForAction: vi.fn(async () => actor),
  requireResponder: vi.fn(async () => actor),
}));

let incidents: typeof import("@/lib/dal/incidents");
let alerts: typeof import("@/lib/dal/alerts");
let auth: typeof import("@/lib/dal/auth");
let session: typeof import("@/lib/dal/session");

beforeAll(async () => {
  database = await createTestDatabase();
  await database.db
    .insert(users)
    .values({ ...actor, passwordHash: await hash("Analyst!2026", 4), isActive: true });
  incidents = await import("@/lib/dal/incidents");
  alerts = await import("@/lib/dal/alerts");
  auth = await import("@/lib/dal/auth");
  session = await import("@/lib/dal/session");
}, 60_000);

beforeEach(async () => {
  vi.clearAllMocks();
  await database.query("TRUNCATE audit_logs, incident_events, alerts, incidents");
  await database.query("UPDATE users SET is_active = true");
});

afterAll(async () => {
  await database?.close();
}, 30_000);

function createReport(overrides: Partial<ReportIncidentInput> = {}) {
  return incidents.createPublicIncident({
    category: "PHISHING",
    channel: "EMAIL",
    title: "Suspicious student support login request",
    description:
      "A message directed me to a lookalike login page and asked for an OTP. I closed it without entering details.",
    impact: "LOW",
    anonymous: true,
    consent: true,
    ...overrides,
  });
}

async function firstIncident() {
  const [row] = await database.query<{ id: string; status: string; version: number }>(
    "SELECT id, status, version FROM incidents LIMIT 1",
  );
  return row;
}

const publicAlert = {
  title: "Published test alert",
  summary: "This published alert should be visible to everyone.",
  content: "Use a known official channel to verify unusual requests before taking action.",
  severity: "MEDIUM" as const,
  tlp: "CLEAR" as const,
  status: "PUBLISHED" as const,
};

describe("PostgreSQL incident and alert persistence", () => {
  it("accepts only correct credentials for an active responder and records the login time", async () => {
    const user = await auth.verifyCredentials(actor.email, "Analyst!2026");
    expect(user).toMatchObject({ id: actor.id, role: "ANALYST" });
    expect(user).not.toHaveProperty("passwordHash");
    expect(await auth.verifyCredentials(actor.email, "wrong-password")).toBeNull();
    const [stored] = await database.query("SELECT last_login_at FROM users WHERE id = $1", [
      actor.id,
    ]);
    expect(stored.last_login_at).toBeInstanceOf(Date);
    await database.query("UPDATE users SET is_active = false WHERE id = $1", [actor.id]);
    expect(await auth.verifyCredentials(actor.email, "Analyst!2026")).toBeNull();
  });

  it("commits the report and timeline before returning and keeps tracking information private", async () => {
    const receipt = await createReport({
      reporterName: "Discard this name",
      reporterEmail: "discard@example.test",
      occurredAt: "2026-11-07T12:34:56.789Z",
    });
    const tracked = await incidents.trackPublicIncident(receipt.referenceCode, receipt.trackingKey);
    expect(tracked).toMatchObject({ referenceCode: receipt.referenceCode, status: "NEW" });
    expect(tracked?.events).toHaveLength(1);
    for (const field of ["trackingKeyHash", "description", "reporterEmail", "reporterName"])
      expect(tracked).not.toHaveProperty(field);
    const [stored] = await database.query(
      "SELECT anonymous, reporter_name, reporter_email, tracking_key_hash, occurred_at FROM incidents",
    );
    expect(stored).toMatchObject({ anonymous: true, reporter_name: null, reporter_email: null });
    expect(stored.tracking_key_hash).not.toBe(receipt.trackingKey);
    expect((stored.occurred_at as Date).toISOString()).toBe("2026-11-07T12:34:56.789Z");
    expect(
      await incidents.trackPublicIncident(receipt.referenceCode, "AAAA-BBBB-CCCC-DDDD"),
    ).toBeNull();
  });

  it("rolls back a report when its initial timeline insert fails", async () => {
    await database.query(
      "ALTER TABLE incident_events ADD CONSTRAINT reject_submission CHECK (event_type <> 'SUBMITTED')",
    );
    try {
      await expect(createReport()).rejects.toThrow();
      expect(await database.query("SELECT id FROM incidents")).toHaveLength(0);
    } finally {
      await database.query("ALTER TABLE incident_events DROP CONSTRAINT reject_submission");
    }
  });

  it("keeps internal notes private and stores explicit reporter updates plus audit metadata", async () => {
    const receipt = await createReport();
    const incident = await firstIncident();
    await incidents.updateIncident({
      incidentId: incident.id,
      status: "TRIAGED",
      severity: "HIGH",
      assignment: "SELF",
      note: "Internal analysis only.",
      visibleToReporter: false,
    });
    let tracked = await incidents.trackPublicIncident(receipt.referenceCode, receipt.trackingKey);
    expect(tracked?.status).toBe("TRIAGED");
    expect(tracked?.events).toHaveLength(1);
    await incidents.updateIncident({
      incidentId: incident.id,
      status: "TRIAGED",
      severity: "HIGH",
      assignment: "KEEP",
      note: "Do not reply to the sender.",
      visibleToReporter: true,
    });
    tracked = await incidents.trackPublicIncident(receipt.referenceCode, receipt.trackingKey);
    expect(tracked?.events).toHaveLength(2);
    expect(tracked?.events[1].note).toBe("Do not reply to the sender.");
    const detail = await incidents.getIncidentDetail(incident.id);
    expect(detail).toMatchObject({ assignedToId: actor.id, severity: "HIGH", version: 3 });
    expect(detail?.events.some((event) => event.note === "Internal analysis only.")).toBe(true);
    const audits = await database.query("SELECT metadata FROM audit_logs");
    expect(audits).toHaveLength(2);
    expect(audits[0].metadata).toMatchObject({ toStatus: "TRIAGED" });
    expect(JSON.stringify(audits)).not.toContain("Internal analysis");
  });

  it("rolls back an update if a related history entry fails", async () => {
    await createReport();
    const incident = await firstIncident();
    vi.mocked(session.getResponderForAction).mockResolvedValueOnce({
      ...actor,
      id: "90000000-0000-4000-8000-000000000099",
    });
    await expect(
      incidents.updateIncident({
        incidentId: incident.id,
        status: "TRIAGED",
        severity: "HIGH",
        assignment: "KEEP",
        note: "This update must roll back.",
        visibleToReporter: true,
      }),
    ).rejects.toThrow();
    expect(await firstIncident()).toMatchObject({ status: "NEW", version: 1 });
    expect(await database.query("SELECT id FROM incident_events")).toHaveLength(1);
    expect(await database.query("SELECT id FROM audit_logs")).toHaveLength(0);
  });

  it("rejects invalid transitions and unauthorized mutations without changing the report", async () => {
    await createReport();
    const incident = await firstIncident();
    const input = {
      incidentId: incident.id,
      status: "CLOSED" as const,
      severity: "LOW" as const,
      assignment: "KEEP" as const,
      note: "",
      visibleToReporter: false,
    };
    await expect(incidents.updateIncident(input)).rejects.toThrow("cannot move");
    vi.mocked(session.getResponderForAction).mockResolvedValueOnce(null);
    await expect(incidents.updateIncident(input)).rejects.toThrow("session has expired");
    vi.mocked(session.getResponderForAction).mockResolvedValueOnce(null);
    await expect(alerts.createAlert(publicAlert)).rejects.toThrow("session has expired");
    expect(await firstIncident()).toMatchObject({ status: "NEW", version: 1 });
    expect(await database.query("SELECT id FROM audit_logs")).toHaveLength(0);
  });

  it("keeps case-insensitive queue searches and correctly converts aggregate counts", async () => {
    expect((await incidents.getDashboardOverview()).totals).toEqual({
      total: 0,
      newCount: 0,
      activeCount: 0,
      criticalCount: 0,
      unassignedCount: 0,
      resolvedCount: 0,
    });
    await createReport({ impact: "CRITICAL" });
    expect(
      await incidents.listIncidents({ query: "STUDENT SUPPORT", status: "NEW", unassigned: true }),
    ).toHaveLength(1);
    expect((await incidents.getDashboardOverview()).totals).toMatchObject({
      total: 1,
      newCount: 1,
      criticalCount: 1,
      unassignedCount: 1,
    });
  });

  it("excludes drafts and handles simultaneous duplicate alert titles without losing audits", async () => {
    const created = await Promise.all([
      alerts.createAlert(publicAlert),
      alerts.createAlert(publicAlert),
    ]);
    expect(new Set(created.map((alert) => alert.slug)).size).toBe(2);
    await alerts.createAlert({
      ...publicAlert,
      title: "Internal draft alert",
      status: "DRAFT",
      tlp: "AMBER",
    });
    const published = await alerts.listPublishedAlerts();
    expect(published).toHaveLength(2);
    expect(published.every((alert) => alert.publishedAt instanceof Date)).toBe(true);
    expect(await alerts.listAllAlerts()).toHaveLength(3);
    expect(
      await database.query("SELECT id FROM audit_logs WHERE entity_type = 'alert'"),
    ).toHaveLength(3);
  });
});
