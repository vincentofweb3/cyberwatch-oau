import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { dirname, resolve } from "node:path";
import { mkdirSync } from "node:fs";
import { schema } from "@/db/schema";

function resolveDatabasePath() {
  const configured = process.env.DATABASE_URL ?? "./data/cyberwatch.db";
  const withoutFilePrefix = configured.startsWith("file:") ? configured.slice(5) : configured;
  return resolve(process.cwd(), withoutFilePrefix);
}

const globalDatabase = globalThis as unknown as {
  cyberwatchSqlite?: Database.Database;
};

const databasePath = resolveDatabasePath();
mkdirSync(dirname(databasePath), { recursive: true });

const sqlite = globalDatabase.cyberwatchSqlite ?? new Database(databasePath);
sqlite.pragma("busy_timeout = 5000");
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("journal_mode = WAL");

if (process.env.NODE_ENV !== "production") {
  globalDatabase.cyberwatchSqlite = sqlite;
}

export const db = drizzle(sqlite, { schema });
export { sqlite, databasePath };
