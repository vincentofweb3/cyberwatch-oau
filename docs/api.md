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

Returns:

```json
{
  "status": "ok",
  "service": "cyberwatch-oau",
  "timestamp": "ISO-8601 timestamp"
}
```

It does not return environment, database path, dependency versions, account counts, or secrets.
