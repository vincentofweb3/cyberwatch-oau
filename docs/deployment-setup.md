# GitHub, Neon, Resend, and Vercel setup

The current checkpoint is the tested SQLite demonstration. Hosted PostgreSQL and email delivery are the next implementation phase; they are not active in this version.

Repository: <https://github.com/vincentofweb3/cyberwatch-oau>

## 1. Preserve the tested application on GitHub

Commit and push the current application before changing its database. Local secrets (`.env.local`), SQLite database files, private evidence, dependencies, build output, and browser artifacts remain excluded from Git. Only `.env.example` contains shareable configuration examples.

The checkpoint has passed lint, TypeScript, 14 unit/integration tests, 8 desktop/mobile browser tests, a production build, HTTP smoke checks, and homepage/dashboard screenshot review. Those checks validate the current SQLite version, not the planned hosted integration.

## 2. Create the hosted database in Neon

1. Sign in at <https://console.neon.tech> and create a project named `cyberwatch-oau`.
2. Choose a region that can also host the Vercel functions. Keeping the app and database in the same region reduces latency.
3. Open **Connect** in the project dashboard and select the database and role for the application.
4. Copy the connection string with **connection pooling** enabled. Save it locally as `NEON_DATABASE_URL` in `.env.local`.
5. Turn connection pooling off and save that connection string as `NEON_DIRECT_URL` in `.env.local` for migrations and maintenance.

These connection strings contain a database password. Keep them in environment settings and out of chat, source code, and Git.

**Keep the existing `DATABASE_URL` unchanged for now.** This checkpoint still expects a SQLite file path. Adding a PostgreSQL URL to that setting before the code migration will break the running application. The `NEON_*` settings above are preparation values; the current app does not consume them.

The implementation phase will:

- replace the SQLite connection and schema with PostgreSQL equivalents;
- convert synchronous queries and transactions to the hosted driver's asynchronous API;
- create and apply PostgreSQL migrations;
- update report, tracking, authentication, alert, audit, and integration-test paths;
- preserve the existing local database and explicitly handle any data transfer;
- configure runtime and migration connection settings, then verify persistence against Neon.

Changing the environment variable alone does not migrate the database. The code and schema migration must happen first. Avoid seeding public demo passwords into a shared deployment; create the hosted responder account with deployment-specific credentials.

Reference: <https://neon.com/docs/get-started-with-neon/connect-neon>

## 3. Prepare Resend

A separate project key is recommended, although an existing suitably scoped key can work.

1. In Resend, open **API Keys** and create a key named `cyberwatch-oau`.
2. Choose **Sending access**. Restrict it to the intended verified sending domain if available.
3. Save the key once as `RESEND_API_KEY` in `.env.local`. Resend does not show its value again after creation.
4. Set `REPORT_NOTIFICATION_TO` to the chosen receiving Gmail address in `.env.local`.
5. After verifying a domain you control, configure a sender such as `CyberWatch <notifications@your-domain.example>`. The sender domain and receiving Gmail address serve different purposes.

For initial tests, the `resend.dev` sender can send only to the email address associated with the Resend account. Verify that the receiving Gmail matches that account before relying on the test sender. Sending to other recipients requires a verified domain you control.

Planned delivery behaviour: save the report and a pending notification record together, send a notification containing the reference/category/severity/time and a link to the protected report, then record the delivery result. Retry failed notifications without creating another incident. Do not email the private tracking key, internal notes, or the full report narrative.

This checkpoint does not send email; providing the key prepares the later integration.

References:

- <https://resend.com/docs/dashboard/api-keys/introduction>
- <https://resend.com/docs/knowledge-base/403-error-resend-dev-domain>

## 4. Connect Vercel after the database migration

Import the GitHub repository into Vercel, select the intended function region, and configure the hosted database connection, session secret, application origin, email sender/recipient, and Resend key in Vercel's environment settings. Match environment names to the completed integration.

Use a separate database/branch for previews, so preview tests cannot change deployed reports. Replace process-memory anti-spam limits with a shared service before making public email notifications available. Never rely on a local SQLite file for durable Vercel storage.

Verify a preview with fictional data: submit a report, confirm it persists in Neon and appears in the analyst workspace, check private tracking, and confirm the notification reaches Gmail. Exercise delivery failure and retry handling before releasing the deployment.

Reference: <https://vercel.com/kb/guide/is-sqlite-supported-in-vercel>
