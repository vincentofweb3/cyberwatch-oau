# Product Requirements

## Product statement

CyberWatch OAU helps a member of the university community report a suspected cyber incident in a few minutes, retain control over how much personal information they disclose, privately track the response, and learn the next safe action. It gives an authorized response team a structured, auditable triage workspace.

## Product status

Independent SIWES academic prototype. It is not an official OAU channel and must not be represented as one without written institutional authorization.

## Primary users

### Community reporter

A student, staff member, applicant, alumnus, contractor, or visitor who encounters a suspicious email, cloned social account, fraudulent request, compromised account, malicious site, malware symptom, or suspected data exposure.

Needs:

- plain-language guidance;
- anonymous reporting option;
- minimal form burden;
- immediate containment advice;
- reference and secret tracking key;
- understandable status updates.

### Security analyst

An authorized responder who validates reports, assigns priority, investigates, adds internal or public notes, and moves incidents through the response lifecycle.

Needs:

- sorted queue;
- fast filters;
- complete but well-structured incident details;
- safe lifecycle actions;
- reporter-visible updates separated from internal notes;
- audit history.

### Administrator

An authorized service owner who can perform analyst work and publish alerts. Future versions may add user and policy administration.

## MVP user journeys

### Submit and track

1. Reporter chooses “Report an incident”.
2. Reporter chooses incident type and channel, describes what occurred, adds indicators, selects impact, and optionally supplies contact details.
3. Server validates, rate-limits, stores the report, creates the initial event, and returns a reference plus a one-time tracking key.
4. Reporter stores both values and receives immediate safety advice.
5. Reporter later supplies both values on `/track` and sees only public status and reporter-visible events.

### Triage and respond

1. Analyst signs in.
2. Dashboard shows new, high-severity, unassigned, and aging incidents.
3. Analyst opens an incident, reviews indicators, assigns it, changes severity or status, and records an internal or reporter-visible update.
4. Every privileged change creates an audit record and incident timeline event.

### Publish an alert

1. Analyst or administrator drafts a short advisory.
2. The advisory is validated, labeled with severity and TLP, and published.
3. It becomes visible on the public alerts page and landing-page alert rail.

## Functional requirements

### Public reporting

- Support anonymous and identified reports.
- Require category, channel, summary, narrative, impact, and acknowledgement of safe-use guidance.
- Accept optional suspicious URL, sender identity, and occurrence time.
- Do not request passwords, OTPs, recovery codes, financial PINs, or full identity documents.
- Include a hidden honeypot and request-level rate limit.
- Return a non-sequential reference and high-entropy tracking key.
- Store only the tracking-key hash.

### Tracking

- Require both reference and tracking key.
- Return the same generic error for unknown references and wrong keys.
- Expose only public status, timestamps, and explicitly reporter-visible events.
- Never expose assignee identity, internal notes, audit metadata, or other reports.

### Authentication

- Support seeded development analyst/admin accounts.
- Hash passwords with bcrypt.
- Use signed HTTP-only cookies, same-site protection, limited lifetime, and secure cookies in production.
- Return a generic invalid-credentials response.

### Incident management

- Filter by status, severity, category, assignment, and text query.
- Enforce the lifecycle in `architecture.md`.
- Permit assignment, severity adjustment, and a note on transitions.
- Distinguish internal notes from reporter-visible updates.
- Record actor and timestamp.

### Alerts and awareness

- Publish alerts with title, slug, summary, content, severity, and TLP.
- Show only published alerts publicly.
- Provide short guidance for phishing, impersonation, compromised accounts, and safe evidence preservation.
- Provide a small educational quiz that stores no personal data.

## Non-functional requirements

- Responsive from 360px upward.
- Keyboard navigable with visible focus states.
- Semantic headings, labels, errors, and live status messages.
- No sensitive values in URLs, logs, analytics, or client bundles.
- Server-render the main information architecture; hydrate only interactive islands.
- Local setup in under ten minutes after dependencies are installed.
- Lint, typecheck, unit tests, and production build must pass.

## Success measures for a supervised pilot

- Median report completion time below five minutes.
- At least 80% of test users can find the report and tracking features without assistance.
- No unauthorized incident data is exposed during role/IDOR testing.
- Analysts can triage a new incident in under two minutes.
- Reporter-visible language is understood by at least 80% of usability participants.

## Institutional validation questions

1. Which office owns intake and response: Computer Centre, CySe Lab, Corporate Affairs, campus security, or a joint team?
2. What categories and severities match existing policy?
3. Which reports must be escalated outside the university?
4. What acknowledgement and resolution targets are realistic?
5. What retention period is legally and operationally approved?
6. Can anonymous reports be acted on, and what misuse controls are required?
7. Which identity provider and official notification channels are available?
