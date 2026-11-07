import { Pool, type PoolConfig } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  getDefaultAutoSelectFamilyAttemptTimeout,
  setDefaultAutoSelectFamilyAttemptTimeout,
} from "node:net";
import { validatePostgresUrl } from "./config";
import { schema } from "./schema";

export function createDatabaseConnection(
  connectionString: string,
  options: Pick<PoolConfig, "max" | "idleTimeoutMillis"> = {},
) {
  const url = new URL(validatePostgresUrl(connectionString));
  // Verify the remote certificate as well as encrypting the connection.
  if (url.hostname.endsWith(".neon.tech")) {
    url.searchParams.set("sslmode", "verify-full");
    // Node's 250ms address-selection timeout can abandon reachable IPv4 addresses
    // on slower networks before falling back to unavailable IPv6. Keep the overall
    // pool timeout below, but give each address time to connect. This Node setting
    // applies process-wide; preserve a longer value configured by the host.
    if (getDefaultAutoSelectFamilyAttemptTimeout() < 2000)
      setDefaultAutoSelectFamilyAttemptTimeout(2000);
  }

  const pool = new Pool({
    connectionString: url.toString(),
    max: options.max ?? 5,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: options.idleTimeoutMillis ?? 10_000,
    allowExitOnIdle: true,
  });
  pool.on("error", () => {
    console.error("An idle PostgreSQL connection failed; the next request will reconnect.");
  });

  return { pool, db: drizzle(pool, { schema }) };
}

export type AppDatabase = ReturnType<typeof createDatabaseConnection>["db"];
