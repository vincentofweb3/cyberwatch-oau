import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createTestDatabase } from "./helpers/database";
import {
  importSqliteSnapshot,
  readSqliteSnapshot,
  type SqliteSnapshot,
} from "../scripts/lib/sqlite-import";

let database: Awaited<ReturnType<typeof createTestDatabase>>;
const timestamp = Date.parse("2026-11-07T12:34:56.789Z");

function legacySnapshot() {
  const source = new Database(":memory:");
  try {
    for (const statement of readFileSync(resolve("drizzle/0000_nosy_magus.sql"), "utf8").split(
      "--> statement-breakpoint",
    )) {
      if (statement.trim()) source.exec(statement);
    }
    source
      .prepare(
        "INSERT INTO users (id, full_name, email, password_hash, role, is_active, last_login_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        "user-1",
        "Migration fixture",
        "migration@example.test",
        "unchanged-password-hash",
        "ANALYST",
        1,
        timestamp,
        timestamp,
        timestamp,
      );
    source
      .prepare(
        "INSERT INTO incidents (id, reference_code, tracking_key_hash, anonymous, category, channel, title, description, impact, severity, assigned_to_id, occurred_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        "incident-1",
        "CW-2026-ABCDEFG",
        "unchanged-tracking-hash",
        1,
        "PHISHING",
        "EMAIL",
        "Fictional migration report",
        "Fictional narrative retained exactly.",
        "LOW",
        "LOW",
        "user-1",
        timestamp,
        timestamp,
        timestamp,
      );
    source
      .prepare(
        "INSERT INTO incident_events (id, incident_id, actor_id, event_type, note, visible_to_reporter, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        "event-1",
        "incident-1",
        "user-1",
        "NOTE_ADDED",
        "Internal migration fixture.",
        0,
        timestamp,
      );
    source
      .prepare(
        "INSERT INTO alerts (id, title, slug, summary, content, severity, status, created_by_id, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        "alert-1",
        "Fictional guidance",
        "fictional-guidance",
        "Fictional summary",
        "Fictional published guidance",
        "LOW",
        "PUBLISHED",
        "user-1",
        timestamp,
        timestamp,
        timestamp,
      );
    source
      .prepare(
        "INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        "audit-1",
        "user-1",
        "incident.updated",
        "incident",
        "incident-1",
        JSON.stringify({ z: 1, a: { safe: true } }),
        timestamp,
      );
    return readSqliteSnapshot(source);
  } finally {
    source.close();
  }
}

async function importSnapshot(snapshot: SqliteSnapshot) {
  if (database.kind === "postgres") return importSqliteSnapshot(database.db, snapshot);
  return importSqliteSnapshot(database.db, snapshot);
}

beforeAll(async () => {
  database = await createTestDatabase();
}, 60_000);
beforeEach(async () => {
  await database.query(
    "TRUNCATE report_notifications, audit_logs, incident_events, alerts, incidents, users",
  );
});
afterAll(async () => {
  await database?.close();
}, 30_000);

describe("SQLite to PostgreSQL migration", () => {
  it("preserves every table, hashes, millisecond timestamps, booleans, and JSON metadata", async () => {
    const snapshot = legacySnapshot();
    expect(await importSnapshot(snapshot)).toBe("imported");
    const [user] = await database.query(
      "SELECT password_hash, is_active, last_login_at FROM users",
    );
    const [incident] = await database.query(
      "SELECT tracking_key_hash, anonymous, occurred_at FROM incidents",
    );
    const [event] = await database.query("SELECT note, visible_to_reporter FROM incident_events");
    const [audit] = await database.query("SELECT metadata FROM audit_logs");
    expect(user).toMatchObject({ password_hash: "unchanged-password-hash", is_active: true });
    expect(incident).toMatchObject({
      tracking_key_hash: "unchanged-tracking-hash",
      anonymous: true,
    });
    expect((user.last_login_at as Date).getTime()).toBe(timestamp);
    expect((incident.occurred_at as Date).getTime()).toBe(timestamp);
    expect(event).toEqual({ note: "Internal migration fixture.", visible_to_reporter: false });
    expect(audit.metadata).toEqual({ a: { safe: true }, z: 1 });
    expect(await database.query("SELECT id FROM alerts")).toHaveLength(1);
  });

  it("accepts an identical repeat without duplicates and refuses to overwrite changed target data", async () => {
    const snapshot = legacySnapshot();
    await importSnapshot(snapshot);
    expect(await importSnapshot(snapshot)).toBe("already-imported");
    expect(await database.query("SELECT id FROM incidents")).toHaveLength(1);
    await database.query("UPDATE incidents SET title = 'Newer target report'");
    await expect(importSnapshot(snapshot)).rejects.toThrow("contains different records");
    expect((await database.query("SELECT title FROM incidents"))[0].title).toBe(
      "Newer target report",
    );
  });

  it("rolls back every table when a source foreign key cannot be imported", async () => {
    const snapshot = legacySnapshot();
    snapshot.incident_events[0].incidentId = "missing-incident";
    await expect(importSnapshot(snapshot)).rejects.toThrow();
    for (const table of ["users", "incidents", "incident_events", "alerts", "audit_logs"]) {
      expect(await database.query(`SELECT id FROM ${table}`)).toHaveLength(0);
    }
  });
});
