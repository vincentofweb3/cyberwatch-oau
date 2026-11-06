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
- unit, SQLite integration, production smoke, and Playwright test suites;
- research, architecture, product, security, API, testing, and continuation documentation.

The user-review corrections are also complete:

- Global base/component CSS uses Tailwind layers so explicit link and button colours apply. Selected analyst navigation has navy text on white, with `aria-current="page"`.
- The analyst profile and seed display **Victor Ibiloju**. The local account was updated without replacing reports or changing credentials; seed upserts refresh display names without resetting passwords.
- The homepage includes an annotated fictional scam, practical recovery steps, and reporting/privacy FAQs.
- The analyst overview includes a four-step workflow guide; the quiz explicitly explains that answers and scores are not saved.
- [Reports, quizzes, and the analyst workspace](./docs/data-and-analyst-guide.md) explains storage, processing, analyst responsibilities, and proposed next features. Quiz persistence and analytics remain proposals.

## Verified state

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
- Drizzle ORM with SQLite for local/demo use; PostgreSQL is the institutional target.
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

The user has selected <https://github.com/vincentofweb3/cyberwatch-oau> for publication and requested Gmail notifications through their existing Resend account, followed by Vercel deployment. The immediate sequence is the GitHub checkpoint, Neon/PostgreSQL migration, Resend delivery with persisted retries, then a verified Vercel preview. See [deployment setup](./docs/deployment-setup.md) for the account-owner steps and implementation scope. Do not replace the SQLite `DATABASE_URL` with a PostgreSQL URL until the database adapter/schema have been migrated. The notification recipient is private configuration and should not be committed.

1. Consider a personal assigned queue, follow-up reminders, incident trends, and minimized exports. Decide separately whether quiz analytics should be anonymous or tied to accounts.
2. Conduct supervised usability testing with students and department responders.
3. Validate ownership, categories, escalation paths, response targets, and retention with the Computer Centre, CySe Lab, Legal/Data Protection personnel, Corporate Affairs, and campus security.
4. Before any institutional pilot, replace SQLite, custom auth, and in-memory rate limiting with PostgreSQL, OAU SSO/MFA, and a distributed limiter.
5. Add private evidence storage only after quarantine, malware scanning, authorization, retention, and safe-download procedures are approved.

## Resume checklist

1. Read `AGENTS.md`, `architecture.md`, `implementation.md`, and this file.
2. Run `git status --short` and preserve unrelated changes.
3. Run `pnpm install`, `pnpm db:setup`, and `pnpm check` as appropriate.
4. Keep all demo data fictional and all public claims explicitly non-official.
5. Update `implementation.md` and this handoff before ending work.
