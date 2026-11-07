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

All checks below, the live PostgreSQL suite, and all desktop/mobile browser cases passed on 2026-11-08 after the Resend integration. Formatting also passed.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The suite now contains 32 local tests across 7 files, 19 live Neon database/import/notification cases, and 12 desktop/mobile browser cases. These cover atomic rollback, authentication, private DTOs/notes, case-insensitive searches, concurrent advisory creation, lossless/repeated/conflicting SQLite imports, notification claims and retries, shared rate limits, and the complete submission-to-tracking workflow. Live tests use dedicated temporary schemas and clean them up afterwards.

Ordinary tests use a fake email transport and explicitly disable real Resend delivery. The separate live delivery check submitted one labelled fictional report (`CW-2026-T65W2EJ`), verified provider acceptance on attempt one and the analyst status on desktop/mobile, and the user confirmed that its notification reached the Gmail Inbox. That test report remains available for review. No private tracking key or API credential was logged.

Neon verification exposed Node's default 250ms connection-address timeout on the workstation's higher-latency network. The connection factory now allows two seconds per address, retaining the overall ten-second pool connection limit and certificate verification. Retry tests anchor their simulated clock to the job's saved schedule so network latency cannot make an eligible test job appear premature.

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
