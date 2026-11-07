# v19.1 React CORS support

The API now has an explicit `ReactClient` CORS policy. Allowed origins are configured under `Cors:AllowedOrigins`.

Default development origins:
- http://localhost:3000
- http://localhost:5173
- https://localhost:3000
- https://localhost:5173

The policy allows all HTTP methods and request headers, including `Authorization`, `Content-Type`, and `X-Tenant-Key`. It does not enable browser credentials/cookies because authentication uses bearer tokens.

For production, replace localhost origins with the exact deployed React origin(s). Do not use `AllowAnyOrigin` for the production API.

CORS middleware executes before tenant resolution/authentication so browser OPTIONS preflight requests are handled before the tenant header is enforced.
