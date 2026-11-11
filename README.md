# CyberWatch OAU

CyberWatch OAU is a secure, student-built SIWES prototype for reporting, tracking, triaging, and learning from cyber incidents affecting members of the Obafemi Awolowo University community.

It is an independent academic prototype. It is **not** an official OAU reporting channel, is not connected to university production systems, and does not guarantee an institutional response.

## What the MVP does

- Accepts anonymous or identified reports for phishing, impersonation, account compromise, malware, suspicious websites, and possible data exposure.
- Generates a non-sequential report reference and a one-time private tracking key.
- Stores only a SHA-256 hash of each tracking key.
- Lets reporters view only public status and deliberately shared timeline updates.
- Gives authorized analysts and administrators a responsive incident queue and detail workspace.
- Enforces documented lifecycle transitions and records privileged changes in an audit log.
- Supports draft and published security advisories with FIRST TLP labels.
- Provides practical awareness guides and a privacy-preserving phishing quiz.

## Technology

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS 4
- Drizzle ORM and PostgreSQL on Neon, with a pooled Node.js connection
- Zod validation, Jose signed sessions, and bcrypt password hashing
- Vitest integration/unit tests and Playwright browser smoke tests

See [architecture.md](./architecture.md), [RESEARCH.md](./RESEARCH.md), and [docs/threat-model.md](./docs/threat-model.md) for the design rationale and security boundaries.

For a plain-language explanation of report storage, the unsaved practice quiz, and how to use the analyst workspace, see [Reports, quizzes, and the analyst workspace](./docs/data-and-analyst-guide.md).

PostgreSQL and Resend report notifications are implemented. See [email setup, retries, and domain verification](./docs/email-delivery.md). Vercel deployment is the next phase, described in [deployment setup](./docs/deployment-setup.md).

## Local setup

Requirements: Node.js 22 or newer, pnpm 10, and a PostgreSQL database (Neon or another PostgreSQL host).

```bash
pnpm install
cp .env.example .env.local
# Fill in DATABASE_URL (pooled), DATABASE_MIGRATION_URL (direct), and SESSION_SECRET.
pnpm db:migrate
pnpm dev
```

Open `http://localhost:3000`.

The migration command creates tables without seeding accounts. For an existing SQLite installation, run `pnpm db:import-sqlite` to preview counts, then `pnpm db:import-sqlite --apply` to create a backup and import all records. The importer verifies every field, preserves existing logins/tracking keys, and refuses to overwrite different target data.

For a fresh, dedicated demo database, set `DEMO_ADMIN_PASSWORD` and `DEMO_ANALYST_PASSWORD` explicitly and run `pnpm db:seed --demo`. Never load real incident information into a public demonstration deployment.

## Demo access

The optional seed creates `admin@cyberwatch.local` and `analyst@cyberwatch.local`, using the passwords you supplied in the two `DEMO_*` settings. The analyst display name is Victor Ibiloju. Importing the old SQLite database preserves its existing account names and password hashes.

The fictional tracking example remains `CW-2026-DEMA247` / `SAFE-DEMA-TRAC-K2X6` when demo data is seeded or imported. Automated browser tests use their own temporary database schema and fixture accounts.

## Commands

| Command           | Purpose                                                                               |
| ----------------- | ------------------------------------------------------------------------------------- |
| `pnpm db:setup`   | Apply PostgreSQL migrations only                                                      |
| `pnpm dev`        | Start the development server                                                          |
| `pnpm lint`       | Run ESLint                                                                            |
| `pnpm typecheck`  | Run strict TypeScript checks                                                          |
| `pnpm test`       | Run unit and PostgreSQL integration tests locally with PGlite                         |
| `pnpm build`      | Create the production Webpack build                                                   |
| `pnpm start`      | Start the production build                                                            |
| `pnpm test:smoke` | Check health, public routes, login UI, and the auth gate against a running server     |
| `pnpm test:e2e`   | Start an isolated PostgreSQL schema/server and run desktop/mobile flows (build first) |
| `pnpm check`      | Run lint, typecheck, tests, and production build                                      |

Use `pnpm test:postgres` to run the database and import tests against an isolated schema in the configured PostgreSQL database. `pnpm db:import-sqlite` previews the legacy data transfer; `--apply` performs it.

For Playwright on a fresh Linux machine:

```bash
pnpm exec playwright install --with-deps chromium
pnpm build
pnpm test:e2e
```

## Main routes

| Route                         | Purpose                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `/report`                     | Submit a minimized incident report                                             |
| `/track`                      | Track a report with its reference and private key                              |
| `/alerts`                     | Read published security advisories                                             |
| `/learn`                      | Use awareness guides and the short quiz                                        |
| `/login`                      | Sign in as an authorized responder                                             |
| `/dashboard`                  | View responder priorities and metrics                                          |
| `/dashboard/incidents`        | Search and filter the incident queue                                           |
| `/dashboard/incidents/[id]`   | Triage and update an incident                                                  |
| `/dashboard/alerts`           | Draft and publish advisories                                                   |
| `/api/health`                 | Minimal readiness response                                                     |
| `/api/notifications/dispatch` | Process pending notification retries (Bearer `CRON_SECRET`; Vercel Cron daily) |

## Production constraints

The app uses hosted PostgreSQL and no longer writes a local database at runtime. The production deployment runs on Vercel at <https://cyberwatch-oau.vercel.app> (see [deployment setup](./docs/deployment-setup.md)); a daily Vercel Cron (`0 6 * * *`) dispatches pending notification retries. Before any wider shared deployment, configure strong account credentials (`pnpm rotate:passwords`), a session secret, the correct application origin, and a verified sender domain. Rate limits coordinate through PostgreSQL; the host must supply trustworthy client-IP headers. An institutional deployment also requires written ownership and policy decisions, OAU SSO with MFA, centralized monitoring, tested backups, approved retention rules, and private malware-scanned evidence storage. Public binary uploads remain excluded until those controls exist.

Do not remove the non-official disclaimer or present this repository as connected to OAU systems without written authorization.

## Continuation

An agent or contributor should read [AGENTS.md](./AGENTS.md), [implementation.md](./implementation.md), and [HANDOFF.md](./HANDOFF.md) before changing the project. Update the execution ledger and handoff whenever implementation or verification state changes.
