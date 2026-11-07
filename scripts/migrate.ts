import "./env";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDatabaseConnection } from "../src/db/connection";
import { getMigrationUrl } from "../src/db/config";

async function main() {
  const { db, pool } = createDatabaseConnection(getMigrationUrl(), { max: 1 });
  try {
    await migrate(db, { migrationsFolder: "./drizzle/postgres" });
    console.log("PostgreSQL migrations applied successfully.");
  } finally {
    await pool.end();
  }
}

main().catch(() => {
  console.error(
    "Database migration failed. Check the direct connection and migration state. Credentials and query data were not logged.",
  );
  process.exitCode = 1;
});
