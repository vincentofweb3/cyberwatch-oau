import { defineConfig } from "drizzle-kit";
import "./scripts/env";
import { getMigrationUrl } from "./src/db/config";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle/postgres",
  dbCredentials: {
    url: getMigrationUrl(),
  },
  strict: true,
  verbose: false,
});
