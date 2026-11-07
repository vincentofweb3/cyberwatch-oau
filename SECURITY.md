# Security Policy

## Scope

CyberWatch OAU is an academic prototype. Do not submit real secrets, malware, identity documents, financial information, or active incident evidence to a public demonstration deployment.

## Reporting a vulnerability

For this repository, report vulnerabilities privately to the project maintainer. Do not open a public issue containing exploit details, session tokens, personal data, or working payloads.

Include:

- affected route or component;
- reproduction steps using non-sensitive test data;
- expected and observed behavior;
- potential impact;
- suggested remediation, if known.

## Security assumptions

- HTTPS is mandatory outside localhost.
- Production secrets must come from a secret manager.
- Seed credentials are development-only.
- Runtime storage is PostgreSQL; keep pooled and direct connection URLs server-side. Neon TLS certificates are verified. SQLite is used only by the explicit legacy importer and tests.
- A public deployment must add distributed rate limiting, monitoring, backups, data retention, OAU identity integration, and private scanned evidence storage.

## Supported versions

Only the latest version on the main development branch is intended to receive fixes during the SIWES project.
