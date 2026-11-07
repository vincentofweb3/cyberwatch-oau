import "./env";
import { spawn } from "node:child_process";
import { getMigrationUrl } from "../src/db/config";

const child = spawn(
  "pnpm",
  ["exec", "vitest", "run", "tests/incidents.integration.test.ts", "tests/sqlite-import.test.ts"],
  {
    stdio: "inherit",
    env: { ...process.env, CYBERWATCH_TEST_DATABASE_URL: getMigrationUrl() },
  },
);
child.on("error", () => {
  console.error("Could not start the PostgreSQL integration tests.");
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
