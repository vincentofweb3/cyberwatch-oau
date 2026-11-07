# Application Interfaces

The primary mutation interface uses same-origin Server Actions. These actions must be treated as public POST endpoints: validate every argument and repeat authentication/authorization inside the server boundary.

## Public actions

### `submitIncident`

Input: incident category, channel, summary, narrative, impact, optional indicators, optional contact details, anonymous flag, consent, and honeypot.

Output on success: reference code, one-time tracking key, initial status, and immediate safety guidance.

Security: Zod validation, honeypot, request fingerprint rate limit, no binary content, safe return DTO.

### `trackIncident`

Input: reference code and tracking key.

Output: minimized incident status DTO and reporter-visible events.

Security: generic mismatch response, constant-time hash comparison where practical, no internal fields.

### `login`

Input: email and password.

Output: generic error or redirect to dashboard.

Security: validation, generic credentials response, signed HTTP-only cookie.

## Protected actions

### `logout`

Deletes the session cookie and redirects to login.

### `updateIncident`

Input: incident ID, target status, severity, assignee intent, note, and reporter-visibility flag.

Security: active analyst/admin session, valid incident ID, permitted transition, audit event.

### `createAlert`

Input: title, summary, content, severity, TLP, and publication state.

Security: active analyst/admin session, validation, unique slug, audit event.

## Route handlers

### `GET /api/health`

Checks PostgreSQL connectivity and returns HTTP 200 when the query succeeds:

```json
{
  "status": "ok",
  "service": "cyberwatch-oau",
  "timestamp": "ISO-8601 timestamp"
}
```

If the database query fails, it returns HTTP 503 with:

```json
{
  "status": "unavailable",
  "service": "cyberwatch-oau"
}
```

Both responses use `Cache-Control: no-store`. The endpoint does not return environment settings, connection details, dependency versions, account counts, or secrets.

### `GET` / `POST /api/notifications/dispatch`

Requires the full `Authorization: Bearer <CRON_SECRET>` header, with a configured secret of at least 32 characters. Missing or incorrect authorization returns 401. An authorized request processes up to three due notification jobs and returns aggregate accepted/retrying/failed/review counts, or `{ "disabled": true }` when email is disabled. Configuration/database failures return a generic 503. Every response is uncached; email contents and credentials are never returned.

The protected `retryNotificationAction` validates the incident ID and requires an active analyst/admin before processing a due notification for that report. It does not bypass retry delays or resend accepted messages.
