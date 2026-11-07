# Agent Handoff

## Mission

Maintain CyberWatch OAU as a professional, secure, independent academic prototype. Never remove the non-official disclaimer or imply that the application is connected to OAU production systems.

## Current state

The MVP is implementation-complete:

- public landing, report, private tracking, alerts, and awareness routes;
- one-time tracking credentials with hash-only storage;
- signed HTTP-only responder sessions and role-aware DAL authorization;
- responder overview, searchable incident queue, incident detail/update workflow, and alert manager;
- lifecycle validation, reporter-visible versus internal events, and audit records;
- responsive design system, empty/loading/error/404/auth-gate states, and mobile navigation;
- Drizzle migration, deterministic seed, health route, security headers, and rate-limit adapters;
- unit, PostgreSQL/import integration, production smoke, and Playwright test suites;
- research, architecture, product, security, API, testing, and continuation documentation.

The user-review corrections are also complete:

- Global base/component CSS uses Tailwind layers so explicit link and button colours apply. Selected analyst navigation has navy text on white, with `aria-current="page"`.
- The analyst profile and seed display **Victor Ibiloju**. The local account was updated without replacing reports or changing credentials; seed upserts refresh display names without resetting passwords.
- The homepage includes an annotated fictional scam, practical recovery steps, and reporting/privacy FAQs.
- The analyst overview includes a four-step workflow guide; the quiz explicitly explains that answers and scores are not saved.
- [Reports, quizzes, and the analyst workspace](./docs/data-and-analyst-guide.md) explains storage, processing, analyst responsibilities, and proposed next features. Quiz persistence and analytics remain proposals.

## PostgreSQL migration — 2026-11-07

- Runtime storage now uses Drizzle's PostgreSQL schema and a bounded `pg` connection pool. Neon TLS certificates are verified; migration scripts use the direct connection.
- The five application tables were created in Neon. Imported and fully verified: 2 accounts, 4 reports, 6 incident events, 2 alerts, and 0 existing audit rows. Existing password hashes, tracking hashes, names, timestamps, and note visibility were preserved.
- The original SQLite database remains unchanged. A consistent backup is at `data/before-neon-3bbfd908-a8a6-4c66-ae37-f5a9cef2376a.db`. Previous environment settings are preserved in `.env.local.before-neon`; both backups are ignored by Git.
- `.env.local` now points `DATABASE_URL` at the pooled URL and `DATABASE_MIGRATION_URL` at the direct URL. The `NEON_*` values remain supported fallback aliases. No credentials were committed or printed.
- `pnpm db:migrate` applies `drizzle/postgres`; the original root SQLite migration is retained for legacy import tests. `pnpm db:setup` no longer seeds data. Optional demo seeding needs `--demo` plus explicit passwords.
- Report creation, updates, and alerts await their database transactions. Incident version conflicts abort the update; duplicate alert slugs are handled without losing audit records. Case-insensitive search is preserved with PostgreSQL `ILIKE`.
- `/api/health` now checks the database and returns 503 when it is unavailable, without exposing connection details.
- Local tests use PGlite; `pnpm test:postgres` runs the same database/import tests in isolated Neon schemas. `pnpm test:e2e` creates its own schema and production server, then cleans both up. Run `pnpm build` first.
- Passed: lint, typecheck, 21 local tests, 11 live PostgreSQL/import tests, production build, and all 10 desktop/mobile browser tests. The browser suite verified submission, analyst assignment and status changes, reload persistence, private notes, and shared tracking updates; its server and isolated schema were removed afterwards.
- Formatting and the final credential-exclusion scan passed. The empty schema left by an earlier interrupted test was verified and removed without touching application tables.
- Resend was still pending at this checkpoint; see the completed email implementation below. Imported demo account passwords still need replacement before a shared deployment.

## Resend report notifications — 2026-11-08

- New reports now save one notification job in the same transaction as the report and initial timeline event. Next.js `after` attempts delivery after returning the receipt. Older imported reports are not emailed retroactively.
- Native server-side fetch calls Resend with a timeout and a stable idempotency key. The immutable message includes only reference, category, severity, timestamp, and a protected dashboard link. API keys, tracking keys, report titles/narratives, contact details, and internal notes are excluded.
- Workers claim jobs with row locks, recover expired claims, persist outcomes, and retry transient errors with backoff. Uncertain jobs stop at six attempts or 23 hours; permanent rejections require investigation. Accepted status does not claim inbox delivery.
- `pnpm notifications:work` runs the local worker; `pnpm notifications:retry` processes one batch. The protected GET/POST dispatch route supports future scheduling. No Vercel deployment or scheduler is active yet.
- Incident pages show delivery status and an authorized control for processing pending mail. Ordinary unit/browser tests explicitly disable real delivery.
- `rate_limits` now coordinates reporting, tracking, and login limits in PostgreSQL. The two-table migration has been applied to Neon. Fingerprints hash scope and client IP without retaining raw IPs; hosts must provide trustworthy forwarding headers.
- Higher-latency connections exposed Node's default 250ms address-selection timeout. Neon connections now raise the process-wide minimum to two seconds, preserve any longer host setting, and retain the ten-second overall connection limit and TLS certificate verification.
- `.env.local` enables the Resend test sender for the confirmed account email. A scheduler secret was generated; previous configuration is in the ignored `.env.local.before-resend`. Keep all of these private.
- A real browser submission created the clearly fictional report `CW-2026-T65W2EJ`. Resend accepted its notification on attempt one, and the user confirmed **Received in Inbox**. The analyst status was visually checked on desktop/mobile. The report is retained for the user to inspect. The Sending-access key cannot query message delivery events; this live test's inbox confirmation came directly from the user.
- Final verification passed: 32 local tests, 19 live PostgreSQL tests, all 12 desktop/mobile browser checks, lint, formatting, TypeScript, and the production build. The final browser server and isolated schema were removed. The credential-exclusion scan passed; the user's original screenshot remains local and untracked.
- [Email delivery and domain setup](./docs/email-delivery.md) explains the test sender, custom DNS verification, worker operation, and delivery limits. Incoming replies and messages to reporters are separate future features.

## Earlier SQLite checkpoint

On 2026-11-06 the following passed:

```bash
pnpm db:setup # against a fresh temporary database
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:smoke # while the production server was running
pnpm test:e2e # against the production server with a temporary seeded database
```

`pnpm test` completed 4 test files and 14 unit/integration tests. All 8 Playwright desktop/mobile tests passed. The production server also returned expected health, public page, auth redirect, form-wiring, and security-header responses.

## Browser-test environment note

`tests/e2e/smoke.spec.ts` covers desktop and mobile public navigation, keyboard access, private tracking, analyst login, and the incident queue. Initial browser execution was blocked by missing system libraries. The review used the existing libraries at `/tmp/opencode/chromium-libs/usr/lib/x86_64-linux-gnu` through `LD_LIBRARY_PATH`, with Chromium and the local server running outside the restricted sandbox. No system installation was needed. The suite now waits for the report page to load, handles repeated status text, and opens the actual mobile menu control.

Separate browser review verified the homepage FAQs, quiz scoring and reset on reload, Victor's profile, and all three selected navigation links on desktop and mobile. Selected-link contrast measured **15.79:1**; reviewed pages had no horizontal overflow. Desktop/mobile homepage and dashboard screenshots were visually inspected and are available for this session in `/tmp/cyberwatch-corrections/`. These temporary paths are not portable project dependencies.

Run on a workstation or CI image with:

```bash
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
```

For future runs, install normal Playwright system dependencies on the workstation or CI image. The temporary library directory used in this review may not exist in a new environment.

## Fixed decisions

- Next.js App Router, React, TypeScript, and Tailwind CSS.
- Drizzle ORM with PostgreSQL on Neon for runtime storage; SQLite is retained only for the explicit legacy importer and tests.
- Webpack/PostCSS for production builds in the managed workspace.
- Stateless signed session cookie for the prototype; OAU SSO/MFA for production.
- Anonymous public tracking with a reference and one-time secret key.
- NIST-aligned incident lifecycle and FIRST TLP labels.
- No public binary upload until private storage and malware scanning exist.
- Authorization remains inside every protected action/DAL method, not only the UI.

## Demo credentials

- Admin: `admin@cyberwatch.local` / `ChangeMe!2026`
- Analyst: `analyst@cyberwatch.local` / `Analyst!2026`
- Tracking: `CW-2026-DEMA247` / `SAFE-DEMA-TRAC-K2X6`

These credentials and sample incidents are development-only. The analyst display name is configured to Victor Ibiloju at the user's request.

## Recommended next work

The user selected <https://github.com/vincentofweb3/cyberwatch-oau> for publication. PostgreSQL and Resend report notifications are implemented. Next validate a Vercel preview with a separate database/branch, strong responder credentials, the correct app origin, and scheduled notification retries. See [deployment setup](./docs/deployment-setup.md). The notification recipient is private configuration and should not be committed.

1. Consider a personal assigned queue, follow-up reminders, incident trends, and minimized exports. Decide separately whether quiz analytics should be anonymous or tied to accounts.
2. Conduct supervised usability testing with students and department responders.
3. Validate ownership, categories, escalation paths, response targets, and retention with the Computer Centre, CySe Lab, Legal/Data Protection personnel, Corporate Affairs, and campus security.
4. Before any institutional pilot, replace custom auth with OAU SSO/MFA, review host/WAF limits and trusted IP headers, and review PostgreSQL roles, backup/restore, and retention.
5. Add private evidence storage only after quarantine, malware scanning, authorization, retention, and safe-download procedures are approved.

## Resume checklist

1. Read `AGENTS.md`, `architecture.md`, `implementation.md`, and this file.
2. Run `git status --short` and preserve unrelated changes.
3. Run `pnpm install`, `pnpm db:setup`, and `pnpm check` as appropriate.
4. Keep all demo data fictional and all public claims explicitly non-official.
5. Update `implementation.md` and this handoff before ending work.
