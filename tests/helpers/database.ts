import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { randomBytes } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { createDatabaseConnection } from "../../src/db/connection";
import { schema } from "../../src/db/schema";

const migrationsDirectory = resolve("drizzle/postgres");

function migrationStatements(namespace = "public") {
  return readdirSync(migrationsDirectory)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .flatMap((name) =>
      readFileSync(resolve(migrationsDirectory, name), "utf8")
        .replaceAll('"public".', `"${namespace}".`)
        .split("--> statement-breakpoint"),
    )
    .filter((statement) => statement.trim());
}

/** Tests own this randomly named schema; cleanup never touches application tables. */
export async function createTestDatabase(
  connectionString = process.env.CYBERWATCH_TEST_DATABASE_URL,
) {
  if (connectionString) {
    const namespace = `cw_test_${randomBytes(8).toString("hex")}`;
    const admin = createDatabaseConnection(connectionString, { max: 1, idleTimeoutMillis: 0 });
    const scopedUrl = new URL(connectionString);
    scopedUrl.searchParams.set("options", `-c search_path=${namespace}`);
    const connection = createDatabaseConnection(scopedUrl.toString(), {
      max: 2,
      idleTimeoutMillis: 0,
    });
    let created = false;

    async function close() {
      await connection.pool.end();
      try {
        if (created) await admin.pool.query(`DROP SCHEMA "${namespace}" CASCADE`);
      } finally {
        await admin.pool.end();
      }
    }

    try {
      await admin.pool.query(`CREATE SCHEMA "${namespace}"`);
      created = true;
      for (const statement of migrationStatements(namespace))
        await connection.pool.query(statement);
      return {
        kind: "postgres" as const,
        db: connection.db,
        connectionString: scopedUrl.toString(),
        async query<T extends Record<string, unknown> = Record<string, unknown>>(
          text: string,
          params: unknown[] = [],
        ): Promise<T[]> {
          return (await connection.pool.query<T>(text, params)).rows;
        },
        close,
      };
    } catch {
      await close();
      throw new Error(
        "Could not prepare the isolated PostgreSQL test schema. Check the direct test connection.",
      );
    }
  }

  const engine = new PGlite();
  try {
    for (const statement of migrationStatements()) await engine.exec(statement);
    return {
      kind: "pglite" as const,
      db: drizzle(engine, { schema }),
      connectionString: undefined,
      async query<T extends Record<string, unknown> = Record<string, unknown>>(
        text: string,
        params: unknown[] = [],
      ): Promise<T[]> {
        return (await engine.query<T>(text, params)).rows;
      },
      close: () => engine.close(),
    };
  } catch (error) {
    await engine.close();
    throw error;
  }
}
