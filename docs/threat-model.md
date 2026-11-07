# Threat Model

Method: lightweight STRIDE analysis with privacy and abuse cases.

## Assets

- Incident narratives and indicators
- Optional reporter identity and contact details
- Tracking keys
- Responder accounts and sessions
- Internal notes and assignment data
- Published alert integrity
- Audit records
- Session and database secrets

## Trust boundaries

1. Public browser to Next.js application
2. Authenticated responder browser to Next.js application
3. Server application to database
4. Server application to Resend, and future SSO, object storage, and monitoring providers
5. Administrator/deployer access to runtime secrets and backups

## Threats and controls

| Threat                 | Example                                    | MVP controls                                                       | Production follow-up                                     |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------- |
| Spoofing               | Attacker signs in as analyst               | bcrypt, signed cookie, generic errors, secure flags                | OAU SSO, MFA, device/session management                  |
| Tampering              | User changes incident ID or status payload | server-side Zod validation, DAL authorization, legal transitions   | signed webhooks, database RLS where appropriate          |
| Repudiation            | Responder denies changing an incident      | append-only incident event and audit log                           | centralized immutable audit sink                         |
| Information disclosure | IDOR exposes another report                | reference + secret key, hash comparison, DTO minimization          | penetration tests, external review                       |
| Denial of service      | Automated report spam                      | honeypot and shared PostgreSQL rate limiter                        | WAF controls and CAPTCHA only if necessary               |
| Elevation of privilege | Analyst calls admin mutation               | required-role checks inside action/DAL                             | policy engine and formal access reviews                  |
| Stored XSS             | Malicious report contains script           | React escaping, no raw HTML, CSP                                   | sanitizer if rich text is introduced                     |
| SQL injection          | Query text alters SQL                      | Drizzle parameterization, strict schemas                           | database monitoring and least-privileged DB user         |
| Tracking key theft     | Key leaks through URL/history              | key returned once in action state, not query string; stored hashed | optional account-bound tracking and key rotation         |
| Sensitive logging      | Description or contact appears in logs     | audit metadata excludes narrative and secrets                      | structured redaction and log classification              |
| Malicious evidence     | Uploaded executable attacks responder      | binary upload excluded from MVP                                    | private quarantine bucket, AV scan, CDR, signed download |
| Alert defacement       | Compromised user publishes false alert     | role checks and audit trail                                        | approval workflow and dual control                       |

## Abuse cases

- False reporting to harass another student or staff member
- Repeated submissions designed to overwhelm analysts
- Reports containing doxxing or unrelated personal data
- Attempts to use the platform as a URL scanner
- Social engineering of analysts through incident narrative
- Guessing references to discover case existence

Controls include minimal public response detail, high-entropy references, generic tracking errors, rate limiting, internal classification, safe viewing guidance, and a documented moderation/escalation policy.

## Privacy review

- Anonymous is the default recommendation when follow-up is unnecessary.
- Contact details are optional and purpose-bound to incident follow-up.
- Tracking secrets are never recoverable from the database.
- Retention is intentionally not automated in the prototype because the institution must approve a schedule.
- Seed data is fictional.

## Residual risks

- PostgreSQL rate limits coordinate across instances; forged or incorrectly trusted forwarding headers and distributed spam still require host/WAF controls.
- Custom prototype authentication lacks MFA and enterprise identity lifecycle controls.
- Hosted PostgreSQL removes reliance on local runtime files; database-role restrictions, backup/restore settings, and retention still need deployment review.
- Administrators with host/database access can read incident content.
- No automated malware or URL reputation analysis exists.
- Legal, disciplinary, emergency, and law-enforcement escalation procedures require institutional policy.
