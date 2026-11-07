# Testing Strategy

## Test pyramid

### Unit tests

- Zod validation boundaries
- Reference and tracking-key format
- Tracking hash verification
- Allowed and rejected incident transitions
- Severity/status presentation helpers
- DTO privacy: internal fields must be absent

### Integration tests

- Incident creation writes an initial public event
- Tracking succeeds with the correct key and fails generically otherwise
- Analyst update writes both incident event and audit log
- Public alert query excludes drafts
- Unauthorized DAL calls fail

### Browser tests

- Landing page navigation
- Report form keyboard access and labelled controls
- Track report flow
- Analyst login and dashboard access
- Desktop and mobile incident queue navigation
- New report submission, analyst assignment/status changes, reload persistence, internal notes, and reporter-visible updates

These are the flows in the current automated smoke suite. Report creation and mutation are covered at both the database and browser levels. A separate manual browser review also exercised the homepage FAQs, quiz scoring/reset, analyst profile, and active navigation contrast, and inspected desktop/mobile screenshots.

## Required checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The PostgreSQL migration passes 21 local tests across 5 files, all 11 live Neon database/import cases, and all 10 desktop/mobile browser tests. These cover atomic rollback, authentication, private DTOs/notes, case-insensitive searches, concurrent advisory creation, lossless/repeated/conflicting SQLite imports, and the complete submission-to-tracking workflow. Live tests use dedicated temporary schemas and clean them up afterwards.

The default unit/integration suite uses an in-memory PostgreSQL engine (PGlite) and needs no external credentials. For the live database suite, configure the direct connection in `.env.local`, then run:

```bash
pnpm test:postgres
```

This creates and drops randomly named `cw_test_*` schemas. The application's `public` tables are not modified. Keep test credentials private.

For browser tests, configure the direct PostgreSQL connection and build first. The runner seeds a separate test schema, chooses an available local port, starts the production server, and cleans up when the tests finish:

```bash
pnpm exec playwright install --with-deps chromium
pnpm build
pnpm test:e2e
```

For production HTTP smoke checks, start the built server in one terminal and run:

```bash
pnpm start
pnpm test:smoke
```

The original SQLite checkpoint's first browser attempt was blocked by missing system libraries. The review used existing libraries through `LD_LIBRARY_PATH=/tmp/opencode/chromium-libs/usr/lib/x86_64-linux-gnu` and ran Chromium and the test server outside the restricted sandbox. That earlier server used a temporary SQLite database. The current browser runner uses isolated PostgreSQL schemas. Desktop/mobile screenshot inspection is complete. Temporary library and screenshot paths are session-specific; use a normal Playwright dependency installation in CI.

## Test-data rules

- Use fictional people, emails, URLs, and incident narratives.
- Never commit production dumps or real incident evidence.
- Keep tests deterministic by using a temporary database.
- Do not assert exact password hashes or session tokens.
