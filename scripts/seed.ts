import "./env";
import { createDatabaseConnection } from "../src/db/connection";
import { getMigrationUrl } from "../src/db/config";
import { seedDemo } from "./lib/seed-data";

async function main() {
  const adminPassword = process.env.DEMO_ADMIN_PASSWORD;
  const analystPassword = process.env.DEMO_ANALYST_PASSWORD;
  if (!process.argv.includes("--demo") || !adminPassword || !analystPassword) {
    throw new Error(
      "Use --demo with both DEMO_ADMIN_PASSWORD and DEMO_ANALYST_PASSWORD to seed a dedicated demo database.",
    );
  }
  const { db, pool } = createDatabaseConnection(getMigrationUrl(), { max: 1 });
  try {
    await seedDemo(db, adminPassword, analystPassword);
    console.log("Fictional demo records seeded. Existing passwords were preserved.");
  } finally {
    await pool.end();
  }
}

main().catch(() => {
  console.error(
    "Demo seed failed. Check the direct database URL, explicit --demo flag, and both DEMO_* password settings. Credentials were not logged.",
  );
  process.exitCode = 1;
});
