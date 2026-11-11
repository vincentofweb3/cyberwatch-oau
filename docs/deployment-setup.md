# GitHub, Neon, Resend, and Vercel setup

The PostgreSQL migration, Resend report notifications, and the production Vercel deployment are complete. Existing SQLite records have been preserved in Neon.

Repository: <https://github.com/vincentofweb3/cyberwatch-oau>

## 1. Preserve the tested application on GitHub

The tested SQLite checkpoint was committed and pushed as `9f497bc` before the PostgreSQL migration. Local secrets (`.env.local`), SQLite database files, private evidence, dependencies, build output, and browser artifacts remain excluded from Git. Only `.env.example` contains shareable configuration examples.

The earlier checkpoint passed the SQLite verification suite. See `docs/testing.md` and `HANDOFF.md` for the current PostgreSQL checks.

## 2. Create the hosted database in Neon

1. Sign in at <https://console.neon.tech> and create a project named `cyberwatch-oau`.
2. Choose a region that can also host the Vercel functions. Keeping the app and database in the same region reduces latency.
3. Open **Connect** in the project dashboard and select the database and role for the application.
4. Copy the connection string with **connection pooling** enabled. Save it locally as `NEON_DATABASE_URL` in `.env.local`.
5. Turn connection pooling off and save that connection string as `NEON_DIRECT_URL` in `.env.local` for migrations and maintenance.

These connection strings contain a database password. Keep them in environment settings and out of chat, source code, and Git.

The app now accepts PostgreSQL URLs. Set `DATABASE_URL` to the pooled URL and `DATABASE_MIGRATION_URL` to the direct URL. `NEON_DATABASE_URL` and `NEON_DIRECT_URL` are also supported as fallback aliases when the corresponding standard setting is empty. A local SQLite path is no longer a valid runtime `DATABASE_URL`.

The migration provides:

- PostgreSQL tables, timezone-aware millisecond timestamps, boolean fields, JSON audit metadata, indexes, and foreign keys;
- asynchronous report/update/alert transactions, conflict detection, and case-insensitive queue search;
- a pooled runtime connection and a separate direct migration connection;
- `pnpm db:migrate` for the schema, and `pnpm db:import-sqlite --apply` for an existing local installation;
- a consistent local SQLite backup and full-field verification before the import commits;
- isolated PostgreSQL integration and browser-test schemas.

The completed import preserved 2 accounts, 4 reports, 6 timeline entries, and 2 advisories. The source SQLite database remains available locally. `pnpm db:setup` now applies migrations only. Demo seeding requires `--demo` and explicit passwords, and should be used only on a dedicated demo database. Change inherited demo credentials before a shared deployment.

Reference: <https://neon.com/docs/get-started-with-neon/connect-neon>

## 3. Configure Resend

A separate project key is recommended, although an existing suitably scoped key can work.

1. In Resend, open **API Keys** and create a key named `cyberwatch-oau`.
2. Choose **Sending access**. Restrict it to the intended verified sending domain if available.
3. Save the key once as `RESEND_API_KEY` in `.env.local`. Resend does not show its value again after creation.
4. Set `REPORT_NOTIFICATION_TO` to the chosen receiving Gmail address in `.env.local`.
5. After verifying a domain you control, configure a sender such as `CyberWatch <notifications@your-domain.example>`. The sender domain and receiving Gmail address serve different purposes.

For initial tests, the `resend.dev` sender can send only to the email address associated with the Resend account. Verify that the receiving Gmail matches that account before relying on the test sender. Sending to other recipients requires a verified domain you control.

Implemented delivery behaviour: save the report and a pending notification record together, send a notification containing the reference/category/severity/time and a link to the protected report, then record whether Resend accepted it. Transient failures can retry without creating another incident. The private tracking key, contact details, internal notes, and full report narrative are excluded.

The account owner confirmed that the receiving Gmail is the Resend account email, so the test sender can be used now. Set `REPORT_NOTIFICATIONS_ENABLED=true` and `REPORT_NOTIFICATION_FROM="CyberWatch OAU <onboarding@resend.dev>"`. See [email delivery](./email-delivery.md) for local workers, deployment scheduling, delivery status, and exact steps to verify a custom domain. Ordinary automated tests explicitly disable real delivery.

References:

- <https://resend.com/docs/dashboard/api-keys/introduction>
- <https://resend.com/docs/knowledge-base/403-error-resend-dev-domain>

## 4. Connect Vercel — completed 2026-11-11

The production deployment is live at <https://cyberwatch-oau.vercel.app> (Vercel project `cyberwatch-oau`, linked through the GitHub repository `vincentofweb3/cyberwatch-oau`).

- Deployed with the Vercel CLI (`vercel deploy --prod`) after `pnpm lint`, `pnpm typecheck`, all 32 tests, and the production build passed.
- Production environment settings (names only): `DATABASE_URL` (Neon pooled URL), `SESSION_SECRET`, `APP_ORIGIN=https://cyberwatch-oau.vercel.app`, `RESEND_API_KEY`, `REPORT_NOTIFICATION_TO`, `REPORT_NOTIFICATION_FROM` (resend.dev test sender), `REPORT_NOTIFICATIONS_ENABLED=true`, and `CRON_SECRET`. `DATABASE_MIGRATION_URL`, `NEON_*`, `DEMO_*`, and `SQLITE_IMPORT_PATH` were deliberately not copied to Vercel.
- `vercel.json` registers a Hobby-safe daily cron (`0 6 * * *`, 06:00 UTC) for `GET /api/notifications/dispatch`. Vercel Cron sends `Authorization: Bearer $CRON_SECRET` automatically, and the route rejects any other caller (verified: 401 without the secret, `{accepted, retrying, failed, review}` with it).
- The demo responder passwords in the hosted Neon database were rotated to new strong random values with `pnpm rotate:passwords` (reads `NEW_ADMIN_PASSWORD` / `NEW_ANALYST_PASSWORD`; values are never printed or committed). The previous demo passwords no longer work. New `SESSION_SECRET` was not required; the existing 42-character secret remains in use.
- Verified after deploy: `/api/health` returns 200 with `status: ok`, and `/`, `/report`, `/login`, and `/track` return 200.
- `.vercelignore` excludes local databases, env files, evidence storage, browser artifacts, and the owner's untracked screenshot from CLI uploads.

Preview deployments should still use a separate Neon branch with email disabled, so preview tests cannot change deployed reports or send mail. The resend.dev test sender can only send to the Resend account email; verify a custom domain before inviting other recipients.

Reference: <https://vercel.com/kb/guide/is-sqlite-supported-in-vercel>
