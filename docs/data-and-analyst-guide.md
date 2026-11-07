# Reports, quizzes, and the analyst workspace

## Where information is saved

The website uses PostgreSQL hosted on Neon, accessed on the server through Drizzle ORM. `DATABASE_URL` selects the pooled runtime connection. Reports persist in the hosted database across page refreshes, local restarts, and deployments. The old `data/cyberwatch.db` file is retained as migration history; the running website no longer saves new reports there.

| Information             | Storage                                | Purpose                                                                                      |
| ----------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------- |
| Reports                 | `incidents`                            | Narrative, category, optional contact details, severity, status, assigned analyst, and dates |
| Report history          | `incident_events`                      | Submission, assignment, status changes, internal notes, and reporter updates                 |
| Responder accounts      | `users`                                | Name, email, role, active status, and hashed password                                        |
| Community advisories    | `alerts`                               | Draft and published guidance                                                                 |
| Privileged changes      | `audit_logs`                           | Who changed an incident or created an advisory, and when                                     |
| Quiz answers and scores | Temporary React state in the open page | Immediate practice feedback only; no database table or saved result                          |

The quiz resets when the page is left or reloaded. There is currently no quiz history, certificate, leaderboard, or analyst view of scores. If persistent results are added later, the product must distinguish anonymous aggregate results from results tied to a student account and explain that choice to participants.

## What happens when someone submits a report

1. The report form sends its fields to a Next.js Server Action. The server rate-limits requests and validates the fields with Zod.
2. The server generates a report reference and a private tracking key. It chooses an initial severity from the reported impact and gives the incident a `NEW` status.
3. A database transaction saves the report and its first timeline entry together. Anonymous reports discard contact fields.
4. The browser receives a receipt, safety guidance, the reference, and the tracking key. Only a SHA-256 hash of the key is saved, so the original key cannot be recovered later.
5. Tracking checks both credentials and returns limited report information and only deliberately shared timeline entries. It excludes the full narrative, contact details, internal notes, and responder identities.
6. An authenticated analyst can update the report. The server checks access and permitted status transitions, then saves the changes, timeline entries, and audit record together.

Public visitors can read published advisories. Full reports require an active analyst or administrator session. Passwords and tracking keys are hashed. The connection to Neon uses TLS with certificate verification. The app does not separately encrypt each report field; database access and the provider's storage/backup controls remain important.

Review the Neon project's backup, restore, and retention settings before deployment. The SQLite importer made a consistent local backup and verified all imported fields before committing. The app does not provide a separate backup scheduler or ongoing synchronization with the legacy SQLite file.

## How to use the analyst page

The analyst account displays **Victor Ibiloju**. The name comes from the account record, so it also appears in assignments and internal history. The seed script uses that name for future setups and refreshes seeded names without resetting existing passwords.

- **Overview:** counts and shortcuts help you find new, critical, and unassigned reports. The priority queue is ordered by severity and recency. The analyst quick guide explains the response workflow.
- **Incidents:** search by reference, title, or sender; filter by status, severity, category, or unassigned reports. Open a report to see the details and timeline.
- **Update incident:** set severity, assign it to yourself or return it to the unassigned queue, choose an allowed status, and record a note. Check **Share this note with the reporter** only when its contents are safe to share.
- **Alerts:** create a draft or publish a separate advisory. Publishing makes that advisory visible on the public site; it does not publish the underlying report. Use `TLP:CLEAR` for public guidance.

A typical lifecycle is **New → Triaged → Investigating → Contained → Resolved → Closed**. Available transitions depend on the current state. Some reports can be resolved without a separate containment step; reports that cannot be acted on can be marked **Not actionable** where permitted. Resolved or closed incidents can be reopened for investigation.

This is a human response workspace. It does not automatically investigate links, scan devices, block attackers, recover accounts, or send notifications. Those actions require the relevant service provider, technical responder, or a future integration.

## Useful next additions

These are proposals, not implemented features:

1. **My assigned reports and follow-up reminders:** make it easier to return to unfinished work and find cases waiting for a response.
2. **Incident trends:** counts by category and week, with a defined date range, to support SIWES reporting and awareness planning.
3. **Filtered exports:** download an authorized, minimized report summary for assessment or team review.
4. **Quiz analytics:** optionally save anonymous completion counts and scores to measure learning; individual history would need a separate identity and privacy design.
5. **Notifications:** acknowledge submissions and notify reporters of shared updates through an explicitly configured delivery service.
