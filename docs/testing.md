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

These are the flows in the current automated smoke suite. Report creation and incident mutation are covered by the integration tests. A separate manual browser review also exercised the homepage FAQs, quiz scoring/reset, analyst profile, and active navigation contrast, and inspected desktop/mobile screenshots.

## Required checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The container verification on 2026-11-06 passed 4 Vitest files containing 14 unit/integration tests, plus all 8 Playwright tests across desktop and mobile Chromium.

For browser tests:

```bash
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
```

For production HTTP smoke checks, start the built server in one terminal and run:

```bash
pnpm start
pnpm test:smoke
```

The first browser attempt was blocked by missing system libraries. The review used existing libraries through `LD_LIBRARY_PATH=/tmp/opencode/chromium-libs/usr/lib/x86_64-linux-gnu` and ran Chromium and the test server outside the restricted sandbox. The server used a separate database at `/tmp/cyberwatch-corrections/review.db` populated with `DATABASE_URL=/tmp/cyberwatch-corrections/review.db pnpm db:setup`. Desktop/mobile screenshot inspection is complete. Temporary library and screenshot paths are session-specific; use a normal Playwright dependency installation in CI.

## Test-data rules

- Use fictional people, emails, URLs, and incident narratives.
- Never commit production dumps or real incident evidence.
- Keep tests deterministic by using a temporary database.
- Do not assert exact password hashes or session tokens.
