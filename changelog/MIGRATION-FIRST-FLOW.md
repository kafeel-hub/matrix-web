# New API first-flow migration

This iteration preserves the approved React UI and migrates only the initial application flow to the new Matrix ASP.NET Core API.

## Flow
1. Login screen: existing `Code` field is used as `X-Tenant-Key`; Name/Password call `POST /api/auth/login`.
2. If the API returns `requiresContextSelection=true`, the existing Company/Branch screen uses `companies[].locations[]` returned by login. No legacy company/location lookup endpoints are called.
3. Proceed calls `POST /api/auth/select-context` with the one-time `preAuthToken`, companyId and locationId.
4. The authenticated response is stored centrally: access/refresh tokens, user, context, modules, lookups and companies.
5. The app lands on `/dashboard`; dashboard calls include both `Authorization: Bearer ...` and `X-Tenant-Key`.
6. Dashboard requests attempt one refresh-token rotation on HTTP 401 and persist the rotated tokens.

## Compatibility
`token`, `CompanyDetails`, `authData` and `comboBox` compatibility fields are populated from the new bootstrap response so the approved header/layout continues to render while the remaining modules are migrated later.

## Intentionally unchanged
The Login, Company/Branch and Dashboard visual layout/theme are not redesigned. Non-dashboard ERP modules still use their old service integration and are outside this first iteration.
