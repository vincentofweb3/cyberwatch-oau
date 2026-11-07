import "./env";
import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createDatabaseConnection } from "../src/db/connection";
import { getMigrationUrl } from "../src/db/config";
import { readSqliteSnapshot, importSqliteSnapshot } from "./lib/sqlite-import";

async function main() {
  const sourcePath = resolve(process.env.SQLITE_IMPORT_PATH ?? "./data/cyberwatch.db");
  let source = new Database(sourcePath, { readonly: true, fileMustExist: true });
  const apply = process.argv.includes("--apply");
  try {
    if (apply) {
      mkdirSync("data", { recursive: true });
      const backup = resolve("data", `before-neon-${randomUUID()}.db`);
      await source.backup(backup);
      source.close();
      source = new Database(backup, { readonly: true, fileMustExist: true });
      console.log(`Consistent SQLite backup: ${backup}`);
    }
    const snapshot = readSqliteSnapshot(source);
    console.log(
      JSON.stringify({
        sourceRows: Object.fromEntries(
          Object.entries(snapshot).map(([name, rows]) => [name, rows.length]),
        ),
      }),
    );
    if (!apply) {
      console.log("Read-only preview. Pass --apply to import and verify every row in PostgreSQL.");
      return;
    }

    const { db, pool } = createDatabaseConnection(getMigrationUrl(), { max: 1 });
    try {
      const status = await importSqliteSnapshot(db, snapshot);
      console.log(
        `PostgreSQL import ${status}; all stored fields verified, including timestamps and credential hashes.`,
      );
    } finally {
      await pool.end();
    }
  } finally {
    source.close();
  }
}

main().catch(() => {
  console.error(
    "SQLite import failed. The local database is preserved. Check connectivity, schema, and existing target data before retrying. No credentials or report content were logged.",
  );
  process.exitCode = 1;
});
