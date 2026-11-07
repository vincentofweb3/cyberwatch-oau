import "./env";
import { spawn, type ChildProcess } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { resolve } from "node:path";
import { getMigrationUrl } from "../src/db/config";
import { createTestDatabase } from "../tests/helpers/database";
import { seedDemo } from "./lib/seed-data";

const requirePackage = createRequire(resolve("package.json"));
const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function availablePort() {
  const listener = createServer();
  await new Promise<void>((resolve, reject) => {
    listener.once("error", reject);
    listener.listen(0, "127.0.0.1", resolve);
  });
  const address = listener.address();
  if (!address || typeof address === "string")
    throw new Error("Could not allocate a browser-test port.");
  await new Promise<void>((resolve, reject) =>
    listener.close((error) => (error ? reject(error) : resolve())),
  );
  return address.port;
}

async function stop(child: ChildProcess | undefined) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise<void>((resolve) => child.once("exit", () => resolve()));
  child.kill("SIGTERM");
  await Promise.race([exited, delay(5000)]);
  if (child.exitCode === null && child.signalCode === null) {
    child.kill("SIGKILL");
    await exited;
  }
}

async function main() {
  if (!existsSync(".next/BUILD_ID")) throw new Error("Run pnpm build before the browser suite.");
  console.log("Preparing an isolated PostgreSQL schema for browser tests.");
  const database = await createTestDatabase(getMigrationUrl());
  if (database.kind !== "postgres")
    throw new Error("Browser tests require a PostgreSQL connection.");
  let server: ChildProcess | undefined;
  let tests: ChildProcess | undefined;
  let interrupted = false;
  const interrupt = () => {
    interrupted = true;
    server?.kill("SIGTERM");
    tests?.kill("SIGTERM");
  };
  process.once("SIGINT", interrupt);
  process.once("SIGTERM", interrupt);

  try {
    console.log("Seeding fictional browser fixtures.");
    await seedDemo(database.db, "ChangeMe!2026", "Analyst!2026");
    const port = await availablePort();
    const origin = `http://127.0.0.1:${port}`;
    const environment = {
      ...process.env,
      DATABASE_URL: database.connectionString,
      APP_ORIGIN: origin,
      SESSION_SECRET: randomBytes(48).toString("hex"),
      PLAYWRIGHT_BASE_URL: origin,
      REPORT_NOTIFICATIONS_ENABLED: "false",
      RESEND_API_KEY: "",
      CRON_SECRET: randomBytes(32).toString("hex"),
    };
    server = spawn(
      process.execPath,
      [
        requirePackage.resolve("next/dist/bin/next"),
        "start",
        "--hostname",
        "127.0.0.1",
        "--port",
        String(port),
      ],
      { stdio: "inherit", env: environment },
    );
    let startFailed = false;
    server.on("error", () => {
      startFailed = true;
    });
    const deadline = Date.now() + 60_000;
    let ready = false;
    while (Date.now() < deadline && !interrupted) {
      if (startFailed || server.exitCode !== null)
        throw new Error("The browser-test server did not start.");
      try {
        const response = await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(3000) });
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {
        /* Wait for the server and its first database connection. */
      }
      await delay(250);
    }
    if (!ready || interrupted) throw new Error("The browser-test server was not ready.");

    tests = spawn(
      process.execPath,
      [requirePackage.resolve("@playwright/test/cli"), "test", ...process.argv.slice(2)],
      { stdio: "inherit", env: environment },
    );
    process.exitCode = await new Promise<number>((resolve) => {
      tests!.once("error", () => resolve(1));
      tests!.once("exit", (code) => resolve(code ?? 1));
    });
  } finally {
    await stop(tests);
    await stop(server);
    await database.close();
    process.removeListener("SIGINT", interrupt);
    process.removeListener("SIGTERM", interrupt);
    console.log("Browser-test server stopped and its isolated database schema removed.");
  }
}

main().catch(() => {
  console.error(
    "Browser checks failed. Check the production build, direct PostgreSQL connection, and installed Playwright browser dependencies.",
  );
  process.exitCode = 1;
});
