# GitHub, Neon, Resend, and Vercel setup

The PostgreSQL migration and Resend report notifications are implemented. Existing SQLite records have been preserved in Neon. Vercel deployment remains the next phase.

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

## 4. Connect Vercel after the database migration

Import the GitHub repository into Vercel, select the intended function region, and configure the hosted database connection, session secret, application origin, email sender/recipient, and Resend key in Vercel's environment settings. Match environment names to the completed integration.

Use a separate database/branch for previews, so preview tests cannot change deployed reports, and leave email disabled unless deliberately testing delivery. PostgreSQL now provides shared anti-spam limits. Configure a scheduler and `CRON_SECRET` for retry dispatch, and verify that client-IP headers come from the hosting platform. Never rely on a local SQLite file for durable Vercel storage.

Verify a preview with fictional data: submit a report, confirm it persists in Neon and appears in the analyst workspace, check private tracking, and confirm the notification reaches Gmail. Exercise delivery failure and retry handling before releasing the deployment.

Reference: <https://vercel.com/kb/guide/is-sqlite-supported-in-vercel>
