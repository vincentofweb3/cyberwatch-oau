import type Database from "better-sqlite3";
import { getTableColumns, sql, type InferInsertModel } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT, PgTable } from "drizzle-orm/pg-core";
import { alerts, auditLogs, incidentEvents, incidents, users, schema } from "../../src/db/schema";

export const importTables = {
  users,
  incidents,
  incident_events: incidentEvents,
  alerts,
  audit_logs: auditLogs,
};

function decodeRow<T extends PgTable>(table: T, row: Record<string, unknown>): InferInsertModel<T> {
  const result: Record<string, unknown> = {};
  for (const [property, column] of Object.entries(getTableColumns(table))) {
    const value = row[column.name];
    if (value === null || value === undefined) {
      if (column.notNull) throw new Error(`Missing required source column: ${column.name}`);
      result[property] = null;
    } else if (column.dataType === "date") {
      if (typeof value !== "number" || !Number.isFinite(value))
        throw new Error(`Invalid source timestamp: ${column.name}`);
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) throw new Error(`Invalid source timestamp: ${column.name}`);
      result[property] = date;
    } else if (column.dataType === "boolean") {
      if (value !== 0 && value !== 1) throw new Error(`Invalid source boolean: ${column.name}`);
      result[property] = value === 1;
    } else if (column.dataType === "json") {
      if (typeof value !== "string") throw new Error(`Invalid source JSON: ${column.name}`);
      result[property] = JSON.parse(value);
    } else {
      result[property] = value;
    }
  }
  return result as InferInsertModel<T>;
}

export function readSqliteSnapshot(source: Database.Database) {
  return source.transaction(() => ({
    users: source
      .prepare("SELECT * FROM users")
      .all()
      .map((row) => decodeRow(users, row as Record<string, unknown>)),
    incidents: source
      .prepare("SELECT * FROM incidents")
      .all()
      .map((row) => decodeRow(incidents, row as Record<string, unknown>)),
    incident_events: source
      .prepare("SELECT * FROM incident_events")
      .all()
      .map((row) => decodeRow(incidentEvents, row as Record<string, unknown>)),
    alerts: source
      .prepare("SELECT * FROM alerts")
      .all()
      .map((row) => decodeRow(alerts, row as Record<string, unknown>)),
    audit_logs: source
      .prepare("SELECT * FROM audit_logs")
      .all()
      .map((row) => decodeRow(auditLogs, row as Record<string, unknown>)),
  }))();
}

export type SqliteSnapshot = ReturnType<typeof readSqliteSnapshot>;

function canonical(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => [key, canonical(value)]),
    );
  return value;
}

function compareRows(expected: unknown[], actual: unknown[]) {
  const normalize = (rows: unknown[]) => rows.map((row) => JSON.stringify(canonical(row))).sort();
  return JSON.stringify(normalize(expected)) === JSON.stringify(normalize(actual));
}

export async function importSqliteSnapshot<T extends PgQueryResultHKT>(
  db: PgDatabase<T, typeof schema>,
  snapshot: SqliteSnapshot,
) {
  return db.transaction(async (transaction) => {
    await transaction.execute(
      sql`LOCK TABLE users, incidents, incident_events, alerts, audit_logs IN SHARE ROW EXCLUSIVE MODE`,
    );
    let empty = true;
    let matches = true;
    for (const [name, table] of Object.entries(importTables)) {
      const rows = await transaction.select().from(table);
      if (rows.length) empty = false;
      if (!compareRows(snapshot[name as keyof SqliteSnapshot], rows)) matches = false;
    }
    if (!empty) {
      if (matches) return "already-imported";
      throw new Error(
        "Target database contains different records; import refused without changing them.",
      );
    }

    if (snapshot.users.length) await transaction.insert(users).values(snapshot.users);
    if (snapshot.incidents.length) await transaction.insert(incidents).values(snapshot.incidents);
    if (snapshot.incident_events.length)
      await transaction.insert(incidentEvents).values(snapshot.incident_events);
    if (snapshot.alerts.length) await transaction.insert(alerts).values(snapshot.alerts);
    if (snapshot.audit_logs.length) await transaction.insert(auditLogs).values(snapshot.audit_logs);

    for (const [name, table] of Object.entries(importTables)) {
      const rows = await transaction.select().from(table);
      if (!compareRows(snapshot[name as keyof SqliteSnapshot], rows))
        throw new Error(`Verification failed for ${name}; import rolled back.`);
    }
    return "imported";
  });
}
