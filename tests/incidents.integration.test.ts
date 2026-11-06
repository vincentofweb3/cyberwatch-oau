import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { hash } from "bcryptjs";

const actor = {
  id: "90000000-0000-4000-8000-000000000001",
  fullName: "Test Analyst",
  email: "analyst@example.test",
  role: "ANALYST" as const,
};

vi.mock("@/lib/dal/session", () => ({
  getResponderForAction: vi.fn(async () => actor),
  requireResponder: vi.fn(async () => actor),
}));

let testDirectory: string;
let sqlite: (typeof import("@/db/client"))["sqlite"];
let createPublicIncident: (typeof import("@/lib/dal/incidents"))["createPublicIncident"];
let trackPublicIncident: (typeof import("@/lib/dal/incidents"))["trackPublicIncident"];
let updateIncident: (typeof import("@/lib/dal/incidents"))["updateIncident"];
let listPublishedAlerts: (typeof import("@/lib/dal/alerts"))["listPublishedAlerts"];
let createAlert: (typeof import("@/lib/dal/alerts"))["createAlert"];
let verifyCredentials: (typeof import("@/lib/dal/auth"))["verifyCredentials"];

beforeAll(async () => {
  testDirectory = mkdtempSync(join(tmpdir(), "cyberwatch-test-"));
  process.env.DATABASE_URL = join(testDirectory, "integration.db");
  delete (globalThis as { cyberwatchSqlite?: unknown }).cyberwatchSqlite;
  vi.resetModules();

  const client = await import("@/db/client");
  sqlite = client.sqlite;
  const migration = readFileSync(join(process.cwd(), "drizzle/0000_nosy_magus.sql"), "utf8");
  for (const statement of migration.split("--> statement-breakpoint")) {
    if (statement.trim()) sqlite.exec(statement);
  }

  const passwordHash = await hash("Analyst!2026", 4);
  sqlite
    .prepare(
      "INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)",
    )
    .run(actor.id, actor.fullName, actor.email, passwordHash, actor.role, Date.now(), Date.now());

  ({ createPublicIncident, trackPublicIncident, updateIncident } =
    await import("@/lib/dal/incidents"));
  ({ listPublishedAlerts, createAlert } = await import("@/lib/dal/alerts"));
  ({ verifyCredentials } = await import("@/lib/dal/auth"));
});

afterAll(() => {
  sqlite?.close();
  delete (globalThis as { cyberwatchSqlite?: unknown }).cyberwatchSqlite;
  if (testDirectory) rmSync(testDirectory, { recursive: true, force: true });
  delete process.env.DATABASE_URL;
});

describe("incident and alert persistence", () => {
  it("accepts only the correct active responder credentials", async () => {
    await expect(verifyCredentials(actor.email, "Analyst!2026")).resolves.toMatchObject({
      id: actor.id,
      role: "ANALYST",
    });
    await expect(verifyCredentials(actor.email, "wrong-password")).resolves.toBeNull();
  });

  it("creates an anonymous report and exposes only the public tracking DTO", async () => {
    const receipt = await createPublicIncident({
      category: "PHISHING",
      channel: "EMAIL",
      title: "Suspicious student support login request",
      description:
        "A message directed me to a lookalike login page and asked for an OTP. I closed it without entering details.",
      impact: "LOW",
      anonymous: true,
      consent: true,
    });

    const tracked = await trackPublicIncident(receipt.referenceCode, receipt.trackingKey);
    expect(tracked).not.toBeNull();
    expect(tracked).toMatchObject({
      referenceCode: receipt.referenceCode,
      status: "NEW",
      title: "Suspicious student support login request",
    });
    expect(tracked?.events).toHaveLength(1);
    expect(tracked).not.toHaveProperty("trackingKeyHash");
    expect(tracked).not.toHaveProperty("description");
    expect(tracked).not.toHaveProperty("reporterEmail");
    expect(await trackPublicIncident(receipt.referenceCode, "AAAA-BBBB-CCCC-DDDD")).toBeNull();
  });

  it("records reporter-visible lifecycle updates and a privileged audit event", async () => {
    const incident = sqlite.prepare("SELECT id FROM incidents LIMIT 1").get() as { id: string };
    await updateIncident({
      incidentId: incident.id,
      status: "TRIAGED",
      severity: "HIGH",
      assignment: "SELF",
      note: "The sender has been confirmed as suspicious. Do not reply.",
      visibleToReporter: true,
    });

    const updated = sqlite
      .prepare("SELECT status, severity, assigned_to_id FROM incidents WHERE id = ?")
      .get(incident.id) as { status: string; severity: string; assigned_to_id: string };
    const visibleEvent = sqlite
      .prepare(
        "SELECT note, visible_to_reporter FROM incident_events WHERE incident_id = ? AND event_type = 'STATUS_CHANGED'",
      )
      .get(incident.id) as { note: string; visible_to_reporter: number };
    const audit = sqlite
      .prepare("SELECT action, metadata FROM audit_logs WHERE entity_id = ?")
      .get(incident.id) as { action: string; metadata: string };

    expect(updated).toEqual({ status: "TRIAGED", severity: "HIGH", assigned_to_id: actor.id });
    expect(visibleEvent.visible_to_reporter).toBe(1);
    expect(visibleEvent.note).toContain("confirmed as suspicious");
    expect(audit.action).toBe("incident.updated");
    expect(audit.metadata).not.toContain("sender has been confirmed");
  });

  it("never includes draft alerts in the public query", async () => {
    await createAlert({
      title: "Published test alert",
      summary: "This published alert should be visible to everyone.",
      content: "Use a known official channel to verify unusual requests before taking action.",
      severity: "MEDIUM",
      tlp: "CLEAR",
      status: "PUBLISHED",
    });
    await createAlert({
      title: "Internal draft alert",
      summary: "This draft must not appear in the public response.",
      content: "Draft content for internal review and verification before public release.",
      severity: "HIGH",
      tlp: "AMBER",
      status: "DRAFT",
    });

    const publicAlerts = await listPublishedAlerts();
    expect(publicAlerts.map((alert) => alert.slug)).toContain("published-test-alert");
    expect(publicAlerts.map((alert) => alert.slug)).not.toContain("internal-draft-alert");
    const alertAudits = sqlite
      .prepare("SELECT count(*) AS count FROM audit_logs WHERE entity_type = 'alert'")
      .get() as { count: number };
    expect(alertAudits.count).toBe(2);
  });
});
