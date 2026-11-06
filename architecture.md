# CyberWatch OAU Architecture

## 1. Purpose

CyberWatch OAU is a secure, student-built prototype for reporting, triaging, tracking, and learning from cyber incidents affecting members of the Obafemi Awolowo University community. It is intentionally positioned as an academic prototype and does not claim to be an official OAU service.

The product solves four connected problems:

1. People need one clear place to report phishing, impersonation, account compromise, malware, suspicious websites, and possible data exposure.
2. Reporters need a privacy-preserving way to check progress without creating an account.
3. Authorized responders need a structured queue, consistent incident states, internal notes, public updates, and an audit trail.
4. The wider community needs short, actionable guidance and verified security alerts.

## 2. Architectural principles

- **Privacy by default:** anonymous reporting is supported; contact details are optional; public tracking uses a separate secret key.
- **Least privilege:** roles are `analyst` and `admin`; authorization is repeated in every mutation and data-access function.
- **Data minimization:** client components receive purpose-built DTOs, never raw database records or password hashes.
- **Secure-by-default workflow:** server validation, signed HTTP-only sessions, strict status transitions, audit events, security headers, and safe error messages.
- **Evidence safety:** untrusted binary evidence is not exposed from `public/`. Local evidence storage is a development adapter only; production requires private object storage, malware scanning, and retention controls.
- **Progressive enhancement:** core forms use Server Actions and work before client JavaScript hydrates.
- **Continuation-friendly:** decisions, constraints, unfinished work, commands, and handoff notes live in versioned Markdown files.

## 3. Standards and research alignment

- **NIST SP 800-61 Rev. 3 (2025):** incident response is treated as part of ongoing cyber-risk management, with preparation, detection, response, and recovery reflected in the workflow.
- **NIST Cybersecurity Framework 2.0:** the product supports Govern, Identify, Protect, Detect, Respond, and Recover through policy notes, awareness, reporting, triage, alerts, and resolution records.
- **FIRST Traffic Light Protocol 2.0:** incidents and alerts carry a TLP label (`CLEAR`, `GREEN`, `AMBER`, or `RED`) to guide sharing.
- **OWASP application-security practices:** server-side validation, output encoding through React, authentication controls, authorization near the data source, secure cookies, CSP, IDOR prevention, and rate-limiting hooks.
- **Nigeria Data Protection Act 2023 principles:** purpose limitation, minimization, confidentiality, retention discipline, and accountable access are treated as design requirements. Legal review is still required before institutional deployment.

See [RESEARCH.md](./RESEARCH.md) and [docs/threat-model.md](./docs/threat-model.md).

## 4. System context

```text
Community member
  ├─ submits incident ───────────────┐
  ├─ tracks with reference + key ───┤
  └─ reads alerts and guidance ─────┤
                                     v
                            Next.js web application
                           ┌─────────────────────────┐
Authorized responder ─────>│ Server Components       │
                           │ Server Actions          │
                           │ Route Handlers          │
                           │ Data Access Layer       │
                           └───────────┬─────────────┘
                                       v
                               SQLite (local/demo)
                               PostgreSQL (target)
```

## 5. Runtime architecture

### Presentation layer

- Next.js App Router and React Server Components render public and authenticated routes.
- Client Components are limited to interactive forms, mobile navigation, filters, copying tracking credentials, and awareness quizzes.
- Tailwind CSS and project-level design tokens provide the visual system.

### Application layer

- Server Actions handle same-origin form mutations.
- Zod schemas validate all untrusted form input.
- Incident services enforce valid status transitions, assignment rules, DTO shaping, and audit creation.
- Public tracking only returns timeline entries explicitly marked `visibleToReporter`.

### Data layer

- Drizzle ORM defines the schema and migrations.
- `better-sqlite3` provides a zero-service local database for demonstrations and assessment.
- The schema avoids SQLite-specific business logic so it can be migrated to PostgreSQL.

### Authentication and authorization

- Passwords are stored as bcrypt hashes.
- Successful login creates a short-lived signed JWT in an HTTP-only, same-site cookie.
- The session payload contains only user ID, role, and expiry.
- Every protected DAL method re-verifies the session and required role.
- UI hiding is never treated as authorization.

## 6. Main routes

| Route                       | Audience      | Purpose                                        |
| --------------------------- | ------------- | ---------------------------------------------- |
| `/`                         | Public        | Trust-focused landing page and latest alerts   |
| `/report`                   | Public        | Submit a minimized incident report             |
| `/track`                    | Public        | Track a report with reference and secret key   |
| `/alerts`                   | Public        | Published, shareable security advisories       |
| `/learn`                    | Public        | Awareness guidance and a short phishing quiz   |
| `/login`                    | Responders    | Authorized staff sign-in                       |
| `/dashboard`                | Analyst/Admin | Operational overview and priority queue        |
| `/dashboard/incidents`      | Analyst/Admin | Search and filter incident queue               |
| `/dashboard/incidents/[id]` | Analyst/Admin | Triage, assign, update, and audit one incident |
| `/dashboard/alerts`         | Analyst/Admin | Draft and publish alerts                       |
| `/api/health`               | Operations    | Readiness response without sensitive details   |

## 7. Data model

### User

Responder identity, role, password hash, status, and timestamps.

### Incident

Reference code, tracking-key hash, optional reporter details, category, channel, narrative, indicators, severity, status, TLP label, assignee, and lifecycle timestamps.

### Incident event

Append-only timeline entry for submission, assignment, status transition, note, or reporter-visible update.

### Alert

Draft or published advisory with severity, TLP label, slug, summary, body, author, and timestamps.

### Audit log

Append-only record of privileged mutations. Metadata excludes raw passwords, tracking keys, and report descriptions.

## 8. Incident lifecycle

```text
NEW -> TRIAGED -> INVESTIGATING -> CONTAINED -> RESOLVED -> CLOSED
  \         \             \             \
   \--------- REJECTED      \------------- RESOLVED
```

Rules:

- `NEW` reports can be triaged or rejected.
- A triaged report can move into investigation.
- Investigation can move to contained, resolved, or rejected.
- Contained reports move to resolved.
- Resolved reports can be closed or reopened to investigating.
- Every transition creates an incident event and audit entry.

## 9. Security boundaries

- Browser input is untrusted.
- Public report/track actions are rate-limited through an adapter; the local adapter is process-memory only.
- The database and session secret are server-only.
- Reporter tracking keys are shown once and stored only as SHA-256 hashes.
- Incident descriptions are never included in audit metadata.
- Published alerts are the only incident-related information intentionally available without authentication.
- Error pages reveal no stack traces in production.

## 10. Deployment architecture

### Demonstration deployment

- Node.js 22+
- Persistent disk
- SQLite database
- HTTPS reverse proxy

### Institutional deployment target

- Managed PostgreSQL with encrypted backups
- Private S3-compatible evidence bucket with antivirus scanning and signed downloads
- OAU identity provider/SSO rather than seeded credentials
- Redis-compatible distributed rate limiting
- Transactional email/SMS provider for acknowledgements
- Centralized logs and security monitoring
- Data-retention jobs and documented incident-response ownership

## 11. Deliberate exclusions from the first MVP

- Automated URL detonation or malware analysis
- Direct mailbox ingestion
- Live OAU SSO integration
- Binary evidence uploads in the public UI
- Automated notifications to law enforcement or external CERTs
- Claims of guaranteed response time

These exclusions avoid presenting unsafe or institutionally unauthorized behavior as complete functionality.
