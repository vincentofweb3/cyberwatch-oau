# Report email notifications

New reports are saved in Neon together with one pending email job. After returning the reporter's private tracking receipt, the server tries to notify the configured analyst inbox through Resend. Email failure does not undo the saved report. Existing reports imported before this feature are not emailed retroactively.

Emails include the reference, category, severity, receipt time, and a link to the protected incident page. They exclude the title, narrative, reporter contact details, suspicious links, tracking key, and internal notes. This feature sends notifications about new reports; it does not ingest email replies or send messages to reporters. Quiz results remain unsaved.

## Current setup without a custom domain

The account owner confirmed that the receiving Gmail address is also the email registered with Resend. This allows the test sender `CyberWatch OAU <onboarding@resend.dev>`. Resend restricts this sender to the account's own address; it cannot be used for arbitrary reporters or additional recipients.

Configure these private settings in `.env.local`:

```dotenv
REPORT_NOTIFICATIONS_ENABLED=true
RESEND_API_KEY=your-project-sending-key
REPORT_NOTIFICATION_TO=your-resend-account-email
REPORT_NOTIFICATION_FROM="CyberWatch OAU <onboarding@resend.dev>"
APP_ORIGIN=http://localhost:3000
CRON_SECRET=your-random-secret-of-at-least-32-characters
```

Run `pnpm db:migrate` and restart the app after changing environment settings. Keep email disabled in ordinary previews and automated tests. Before deploying, change `APP_ORIGIN` to the actual HTTPS site origin so emails link to the correct dashboard. The API key is used only on the server.

On higher-latency networks, Node's default 250ms connection-address selection can fail before reaching Neon. The connection factory raises this process-wide minimum to two seconds when using Neon, preserves a longer host setting, and retains the overall ten-second database connection limit and certificate verification.

## Delivery status and retries

| Status                | Meaning                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| Queued for email      | Waiting for an attempt or a retry window                               |
| Sending notification  | A worker has claimed the job                                           |
| Accepted by Resend    | Resend returned an email ID; this is not proof of inbox placement      |
| Email needs attention | Resend rejected the request, for example because of sender permissions |
| Delivery needs review | Retries reached their safety limit; check Resend before resending      |

The analyst incident page shows this status. Check Resend's **Emails** dashboard for delivery, bounce, or suppression information, and check the receiving mailbox, including Spam. This version does not receive Resend delivery webhooks or read Gmail.

Transient failures retry after 1 minute, 5 minutes, 15 minutes, 1 hour, and 4 hours, when a worker next runs. A new submission also processes a small batch of older due jobs. For automatic retries during quiet periods in local development, run a separate terminal:

```bash
pnpm notifications:work
```

The worker checks every 30 seconds. `pnpm notifications:retry` processes one batch and exits. The analyst's **Check pending email** button processes a due job without bypassing its wait period. No worker runs just because the database is hosted; keep the local worker running or configure a scheduler when deploying.

The protected `GET`/`POST /api/notifications/dispatch` endpoint processes up to three jobs. It requires `Authorization: Bearer <CRON_SECRET>` and returns only aggregate counts. Configure a scheduler to call it about every five minutes on deployment. Vercel Cron uses GET and supplies the configured `CRON_SECRET`; choose a schedule supported by the Vercel plan, or use an external scheduler. No production schedule is activated by this repository yet.

Workers claim jobs atomically, recover claims abandoned for over a minute, and retain the same email payload and Resend idempotency key on retries. Resend retains keys for 24 hours, so this app stops uncertain automatic retries at six attempts or 23 hours after the first attempt. A job that has never been attempted may still send later. Terminal jobs require an operator to investigate; there is no automatic resend that could duplicate an already accepted email.

Report, tracking, and sign-in limits live in PostgreSQL and coordinate across server instances. Keys are salted hashes of request scope and client IP; raw IPs are not stored. Workers remove limit records expired for over a day. The deployment must supply trustworthy client-IP headers; rate limiting does not replace monitoring or a WAF.

## Verify a domain for a custom sender

1. Use a domain you own, or buy one from a registrar such as Cloudflare or Namecheap. Gmail addresses and a shared `vercel.app` hostname cannot be verified as your sending domain.
2. In Resend, open **Domains → Add Domain**. Add a dedicated subdomain such as `notifications.yourdomain.com` and select a sending region.
3. Open the domain's **Records** tab. At its DNS provider, copy the exact names, types, values, and MX priorities Resend supplies for **sending**. These verify DKIM and SPF; the displayed records may be TXT, MX, or CNAME. Do not guess record values or replace unrelated existing mail records.
4. If using Cloudflare, set any email-verification CNAME to **DNS only**. Leave inbound receiving disabled unless you also intend to build email ingestion.
5. Return to Resend and wait for **Verified**. Verification often takes minutes, but DNS propagation can take up to 72 hours. Add a suitable DMARC record using Resend's guidance.
6. Change `REPORT_NOTIFICATION_FROM` to an address under the exact verified domain, for example `CyberWatch OAU <reports@notifications.yourdomain.com>`. Keep `REPORT_NOTIFICATION_TO` as the receiving Gmail. Use a Sending-access API key whose scope permits that domain.
7. Update the same settings in Vercel when deploying, restart/redeploy, and submit a fictional report to verify the sender. Keep open/click tracking off for these incident notifications.

A verified sender domain lets Resend send to other recipients too. Adding reporter acknowledgements would still be a separate feature with explicit recipient validation and privacy decisions.

References: [Resend domain setup](https://resend.com/docs/add-a-domain), [test-sender restriction](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain), [idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys).
