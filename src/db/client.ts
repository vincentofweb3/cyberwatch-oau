import "server-only";
import { createDatabaseConnection } from "./connection";
import { getDatabaseUrl } from "./config";

const globalDatabase = globalThis as unknown as {
  cyberwatchPostgres?: ReturnType<typeof createDatabaseConnection>;
};

const connection = globalDatabase.cyberwatchPostgres ?? createDatabaseConnection(getDatabaseUrl());
globalDatabase.cyberwatchPostgres = connection;

export const db = connection.db;
