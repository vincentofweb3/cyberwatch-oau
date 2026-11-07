import "./env";
import { setTimeout as delay } from "node:timers/promises";
import { getDatabaseUrl } from "../src/db/config";
import { createDatabaseConnection } from "../src/db/connection";
import { readNotificationConfig } from "../src/lib/notifications/message";
import { processNotificationBatch } from "../src/lib/notifications/worker";

async function main() {
  const config = readNotificationConfig(process.env);
  if (!config) throw new Error("Email delivery is disabled.");
  const connection = createDatabaseConnection(getDatabaseUrl(), { max: 2 });
  const watch = process.argv.includes("--watch");
  const controller = new AbortController();
  const stop = () => controller.abort();
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  try {
    do {
      try {
        console.log(JSON.stringify(await processNotificationBatch(connection.db, config)));
      } catch {
        console.error(
          "Notification processing interrupted; saved jobs remain available for retry.",
        );
        if (!watch) process.exitCode = 1;
      }
      if (watch)
        await delay(30_000, undefined, { signal: controller.signal }).catch(() => undefined);
    } while (watch && !controller.signal.aborted);
  } finally {
    process.removeListener("SIGINT", stop);
    process.removeListener("SIGTERM", stop);
    await connection.pool.end();
  }
}

main().catch(() => {
  console.error("Email worker could not start. Check the private email and database settings.");
  process.exitCode = 1;
});
