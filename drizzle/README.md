# Database migrations

`postgres/` contains the active PostgreSQL migration history. Generate changes with `pnpm db:generate` and apply them with `pnpm db:migrate` using the direct PostgreSQL connection.

The original SQLite SQL file and `meta/` directory at this directory's root are retained as the legacy schema reference and for import tests. Do not apply those files to PostgreSQL. They are not part of the active migration command.

Existing SQLite records can be previewed with `pnpm db:import-sqlite` and transferred with `pnpm db:import-sqlite --apply`. The importer creates a consistent local backup, imports all five tables in one transaction, and verifies every field before commit. An identical repeat is accepted without duplicates; a populated target with different data is refused.
