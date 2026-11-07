type DatabaseEnvironment = Record<string, string | undefined>;

export function validatePostgresUrl(value: string | undefined, setting = "DATABASE_URL") {
  if (!value?.trim()) throw new Error(`${setting} is required. Configure a PostgreSQL URL.`);
  try {
    const url = new URL(value);
    if (
      !["postgres:", "postgresql:"].includes(url.protocol) ||
      !url.hostname ||
      url.pathname.length < 2
    ) {
      throw new Error("Invalid PostgreSQL URL");
    }
  } catch {
    throw new Error(`${setting} must be a PostgreSQL connection URL, not a local file path.`);
  }
  return value.trim();
}

export function getDatabaseUrl(environment: DatabaseEnvironment = process.env) {
  return validatePostgresUrl(environment.DATABASE_URL || environment.NEON_DATABASE_URL);
}

export function getMigrationUrl(environment: DatabaseEnvironment = process.env) {
  const value = validatePostgresUrl(
    environment.DATABASE_MIGRATION_URL ||
      environment.NEON_DIRECT_URL ||
      getDatabaseUrl(environment),
    "DATABASE_MIGRATION_URL",
  );
  if (new URL(value).hostname.includes("-pooler.")) {
    throw new Error(
      "Migrations require the direct PostgreSQL URL, without -pooler in its hostname.",
    );
  }
  return value;
}
