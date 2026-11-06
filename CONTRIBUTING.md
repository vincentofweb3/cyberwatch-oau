# Contributing

1. Read `AGENTS.md`, `architecture.md`, `implementation.md`, and `SECURITY.md`.
2. Create focused changes and do not weaken authentication, authorization, validation, audit, or privacy controls for convenience.
3. Use the server-only data access layer for database access.
4. Validate all public input with Zod and return safe, user-facing errors.
5. Add or update tests for behavior changes.
6. Run `pnpm check` before handoff.
7. Update `implementation.md` and `HANDOFF.md` when work changes the current project state.

Commit messages should explain the product behavior changed, not only the files touched.
