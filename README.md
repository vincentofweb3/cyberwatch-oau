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
- Drizzle ORM and SQLite for local demonstration
- Zod validation, Jose signed sessions, and bcrypt password hashing
- Vitest integration/unit tests and Playwright browser smoke tests

See [architecture.md](./architecture.md), [RESEARCH.md](./RESEARCH.md), and [docs/threat-model.md](./docs/threat-model.md) for the design rationale and security boundaries.

For a plain-language explanation of report storage, the unsaved practice quiz, and how to use the analyst workspace, see [Reports, quizzes, and the analyst workspace](./docs/data-and-analyst-guide.md).

The next deployment phase is described in [GitHub, Neon, Resend, and Vercel setup](./docs/deployment-setup.md). This checkpoint uses local SQLite; hosted PostgreSQL and email notifications are not yet implemented.

## Local setup

Requirements: Node.js 22 or newer and pnpm 10.

```bash
pnpm install
cp .env.example .env.local
pnpm db:setup
pnpm dev
```

Open `http://localhost:3000`.

The database command applies migrations and inserts deterministic fictional demo data. Never load real incident information into a public demonstration deployment.

## Demo access

| Purpose         | Credential                                  |
| --------------- | ------------------------------------------- |
| Administrator   | `admin@cyberwatch.local` / `ChangeMe!2026`  |
| Analyst         | `analyst@cyberwatch.local` / `Analyst!2026` |
| Report tracking | `CW-2026-DEMA247` / `SAFE-DEMA-TRAC-K2X6`   |

These defaults are development-only. Change them before any shared deployment.

## Commands

| Command           | Purpose                                                                           |
| ----------------- | --------------------------------------------------------------------------------- |
| `pnpm db:setup`   | Apply migrations and seed fictional data                                          |
| `pnpm dev`        | Start the development server                                                      |
| `pnpm lint`       | Run ESLint                                                                        |
| `pnpm typecheck`  | Run strict TypeScript checks                                                      |
| `pnpm test`       | Run unit and database integration tests                                           |
| `pnpm build`      | Create the production Webpack build                                               |
| `pnpm start`      | Start the production build                                                        |
| `pnpm test:smoke` | Check health, public routes, login UI, and the auth gate against a running server |
| `pnpm test:e2e`   | Run desktop and mobile Playwright flows                                           |
| `pnpm check`      | Run lint, typecheck, tests, and production build                                  |

For Playwright on a fresh Linux machine:

```bash
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
```

## Main routes

| Route                       | Purpose                                           |
| --------------------------- | ------------------------------------------------- |
| `/report`                   | Submit a minimized incident report                |
| `/track`                    | Track a report with its reference and private key |
| `/alerts`                   | Read published security advisories                |
| `/learn`                    | Use awareness guides and the short quiz           |
| `/login`                    | Sign in as an authorized responder                |
| `/dashboard`                | View responder priorities and metrics             |
| `/dashboard/incidents`      | Search and filter the incident queue              |
| `/dashboard/incidents/[id]` | Triage and update an incident                     |
| `/dashboard/alerts`         | Draft and publish advisories                      |
| `/api/health`               | Minimal readiness response                        |

## Production constraints

The local design is intentionally self-contained for assessment. An institutional deployment requires written ownership and policy decisions, OAU SSO with MFA, PostgreSQL, distributed rate limiting, centralized monitoring, encrypted backups, approved retention rules, and private malware-scanned evidence storage. Public binary uploads remain excluded until those controls exist.

Do not remove the non-official disclaimer or present this repository as connected to OAU systems without written authorization.

## Continuation

An agent or contributor should read [AGENTS.md](./AGENTS.md), [implementation.md](./implementation.md), and [HANDOFF.md](./HANDOFF.md) before changing the project. Update the execution ledger and handoff whenever implementation or verification state changes.
