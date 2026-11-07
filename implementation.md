# CyberWatch OAU Implementation Plan

Last updated: 2026-11-08

This file is the execution ledger. Any future agent should update the checkboxes, the decision log, and `HANDOFF.md` before ending work.

## Phase 0 — Product selection and research

- [x] Select the cyber incident-reporting project over a general academic service desk.
- [x] Review OAU's public cybersecurity tips, scam warnings, security-summit notice, computing faculty page, and existing portals.
- [x] Review the ITF/OAU context to avoid duplicating central student systems.
- [x] Review NIST SP 800-61 Rev. 3 and NIST CSF 2.0.
- [x] Adopt TLP 2.0 labels and privacy-by-default reporting.
- [x] Review Next.js 16 guidance for Server Components, mutations, forms, auth, data security, route handlers, CSP, and production readiness.

## Phase 1 — Foundation and documentation

- [x] Scaffold Next.js 16, React 19, TypeScript, Tailwind CSS.
- [x] Add ORM, SQLite driver, validation, session, password, icon, and test dependencies.
- [x] Write `architecture.md`.
- [x] Write research, product, threat-model, security, API, testing, and handoff documents.
- [x] Configure scripts, environment template, formatting, security headers, and dependency build allow-list.

## Phase 2 — Backend and domain model

- [x] Define Drizzle tables, indexes, relations, and migrations.
- [x] Create local database connection and deterministic seed data.
- [x] Implement password verification and signed session cookies.
- [x] Implement the server-only DAL and safe DTOs.
- [x] Implement incident reference and tracking-key generation.
- [x] Implement report, track, login/logout, incident transition, assignment, and alert actions.
- [x] Implement health route and rate-limit adapter.
- [x] Add audit logging to all privileged changes.

## Phase 3 — UI and experience

- [x] Establish design tokens, typography, focus states, motion policy, and responsive layout.
- [x] Build landing page, public header/footer, and trust/disclaimer components.
- [x] Build incident report form and one-time tracking credential result.
- [x] Build tracking page and reporter-visible timeline.
- [x] Build alerts and awareness pages.
- [x] Build login page.
- [x] Build dashboard shell, overview, incident queue, incident detail, and alert manager.
- [x] Add loading, empty, error, 404, and unauthorized redirect states.

## Phase 4 — Verification

- [x] Add unit tests for validators, transitions, tracking hashes, and DTO privacy.
- [x] Add integration coverage for public report, credentials, responder mutation, alert audit, and public-alert paths.
- [x] Add Playwright desktop/mobile smoke flows and keyboard/label checks.
- [x] Run database setup from a clean temporary state.
- [x] Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
- [x] Run the production server and exercise health, public routes, form wiring, auth gating, and security headers.
- [x] Visually inspect desktop and mobile homepage/dashboard screenshots. Browser execution succeeded using existing temporary Chromium libraries and permission to run the browser outside the sandbox.

## Phase 5 — Handoff

- [x] Update README with exact setup, demo accounts, scripts, and deployment constraints.
- [x] Update `HANDOFF.md` with completed work and known issues.
- [x] Record final security limitations and recommended next institutional steps.

## User-review corrections

- [x] Fix selected analyst navigation contrast through CSS cascade layers and expose active-page semantics.
- [x] Replace the seeded analyst placeholder with Victor Ibiloju and update the existing local account without resetting data or credentials.
- [x] Extend the homepage with an annotated scam example, recovery guidance, and reporting/privacy FAQs.
- [x] Add an analyst workflow guide and clarify the quiz's temporary, unsaved results.
- [x] Document report processing, database tables, analyst responsibilities, and proposed additions in `docs/data-and-analyst-guide.md`.
- [x] Correct existing browser-test selectors/loading assumptions; pass all 8 desktop/mobile tests.

## PostgreSQL migration

- [x] Validate both saved Neon URLs without disclosing credentials.
- [x] Adopt PostgreSQL tables, native booleans/JSON, millisecond timezone-aware timestamps, and a pooled runtime connection.
- [x] Convert all report/update/alert transactions to awaited asynchronous operations and retain safe DTOs and authorization.
- [x] Add optimistic conflict handling and conflict-safe advisory slugs; preserve case-insensitive searches.
- [x] Generate and apply the PostgreSQL migrations through the direct connection.
- [x] Back up SQLite, import all five tables, verify every field, and activate the local PostgreSQL runtime settings.
- [x] Add rollback, privacy, timestamp, import-repeat, and import-conflict tests; pass 21 local tests and 11 live Neon tests.
- [x] Pass lint, TypeScript, and production build.
- [x] Complete all 10 desktop/mobile browser checks against an isolated PostgreSQL schema and remove its server and schema afterwards.
- [x] Commit and push the verified PostgreSQL migration.

## Resend report notifications

- [x] Confirm the receiving Gmail matches the Resend account and configure its test sender.
- [x] Add an atomic notification queue, immutable minimized messages, provider acceptance records, leased workers, and bounded retries with idempotency.
- [x] Add analyst delivery status, an authorized pending-email control, a protected dispatch endpoint, and local worker commands.
- [x] Replace process-memory request limits with shared PostgreSQL limits and apply the additive migration.
- [x] Test queue rollback, privacy, concurrent claims, retry timing, error handling, authorization, and shared request limits.
- [x] Submit one labelled fictional report through the real browser workflow and verify Resend acceptance on the first attempt.
- [x] Confirm with the user that the notification reached the Gmail Inbox.
- [x] Document custom sender-domain verification, delivery status limitations, and deployment scheduling.
- [x] Finish final verification and publish the Resend checkpoint to GitHub.

## Verification record

On 2026-11-08, the Resend integration passed 32 local tests, 19 live PostgreSQL tests, all 12 desktop/mobile browser checks, lint, formatting, TypeScript, and the production build. The user confirmed that the fictional report notification arrived in the Gmail Inbox. Final checks used the corrected Neon connection timeout, with test servers and temporary schemas cleaned up. Real credentials and the user's screenshot were excluded from publication.

On 2026-11-07, prepared the tested application checkpoint for the user's GitHub repository and documented the Neon, Resend, and Vercel setup sequence in `docs/deployment-setup.md`. Local secrets, database files, and test artifacts were checked for Git exclusion. That checkpoint preceded the PostgreSQL work below; email delivery remains a later phase.

The PostgreSQL migration subsequently passed lint, typecheck, 21 local tests, 11 live Neon integration/import tests, the production build, and all 10 desktop/mobile browser tests. The browser suite used an isolated PostgreSQL schema and verified report submission, analyst updates, persistence after reload, and the separation of private notes from reporter-visible updates. The live import preserved all fields across 2 accounts, 4 reports, 6 timeline entries, and 2 advisories; the original SQLite database remains unchanged.

Verified on 2026-11-06:

- `pnpm db:setup` succeeded against a fresh temporary SQLite database.
- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed: 4 test files and 14 unit/integration tests.
- `pnpm build` passed with Next.js 16.4.5 using the supported Webpack/PostCSS path.
- The production server returned a healthy readiness response, rendered public routes, exposed the expected security headers, wired progressive Server Action forms, and redirected an unauthenticated dashboard request to `/login`.
- `pnpm test:smoke` passed against the production server.
- The initial Playwright environment blocker was resolved using the already available libraries in `/tmp/opencode/chromium-libs/usr/lib/x86_64-linux-gnu` and running Chromium outside the restricted sandbox. No system packages were installed.
- All 8 Playwright desktop/mobile smoke tests passed against a production server using `/tmp/cyberwatch-corrections/review.db`, a separately migrated and seeded database.
- Additional browser review passed for the homepage FAQs, quiz scoring/reset, profile name, and all three active sidebar links on desktop/mobile. The selected links have a 15.79:1 text/background contrast ratio. Reviewed routes had no horizontal overflow.
- Desktop/mobile homepage and dashboard screenshots were visually inspected; session artifacts are in `/tmp/cyberwatch-corrections/`.

## Definition of done

The MVP is done when a user can submit and privately track a report; an authorized analyst can log in, view the queue, triage and update an incident, and publish an alert; data persists in PostgreSQL; authorization is enforced at the data layer; the application passes lint, typecheck, tests, and production build; and all setup/handoff documents accurately match the repository.

## Decision log

| Date       | Decision                                                                   | Reason                                                                                                                |
| ---------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 2026-11-06 | Build CyberWatch OAU                                                       | Stronger cybersecurity identity and direct evidence of OAU scam/incident-awareness needs                              |
| 2026-11-06 | Treat the product as an independent academic prototype                     | Avoid implying institutional authorization or guaranteed incident response                                            |
| 2026-11-06 | Use public tracking reference + secret key                                 | Allows anonymous progress checks without collecting an account or excess PII                                          |
| 2026-11-06 | Use SQLite locally and target PostgreSQL in production                     | Simple SIWES demonstration with a credible migration path                                                             |
| 2026-11-06 | Exclude public binary uploads from MVP                                     | Safe production uploads require malware scanning, private object storage, retention, and incident-handling procedures |
| 2026-11-06 | Use custom stateless auth only for the prototype                           | Keeps the demo self-contained; institutional deployment must use OAU SSO or a managed auth provider                   |
| 2026-11-06 | Use Webpack/PostCSS for the production build                               | Tailwind's Turbopack adapter needs an internal worker port unavailable in the managed build sandbox                   |
| 2026-11-06 | Limit build workers to one for the SQLite demo                             | Keeps build-time module evaluation deterministic for a single-file local database                                     |
| 2026-11-06 | Put base styles and custom components into CSS layers                      | Lets Tailwind utility colours take effect, fixing selected navigation and themed controls                             |
| 2026-11-06 | Keep quiz results transient and explain this clearly                       | The current quiz is private practice; persistent analytics need an explicit product decision                          |
| 2026-11-07 | Use pooled PostgreSQL runtime connections and direct migration connections | Supports Vercel without local runtime database files and keeps transactional migrations separate                      |
| 2026-11-07 | Import legacy data in one verified transaction after a consistent backup   | Preserves logins, tracking keys, history, and timestamps without overwriting newer hosted data                        |
| 2026-11-08 | Use Resend's test sender for the confirmed account inbox                   | Enables the requested Gmail notifications before a custom domain is available                                         |
| 2026-11-08 | Persist minimized email jobs and bounded idempotent retries                | Keeps email failures separate from report saving and avoids blind duplicate sends                                     |
| 2026-11-08 | Coordinate request limits in PostgreSQL                                    | Preserves abuse limits across restarts and multiple server instances                                                  |
| 2026-11-08 | Allow two seconds per connection address when using Neon                   | Resolves premature Node address-selection timeouts on higher-latency networks while retaining verified TLS            |
