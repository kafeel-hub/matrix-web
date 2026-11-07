# v8 refresh-token authentication

- Access tokens remain short-lived JWTs (`Jwt:AccessTokenMinutes`, default 30 minutes).
- Refresh tokens are opaque 64-byte cryptographically random values (`Jwt:RefreshTokenDays`, default 30 days).
- Only SHA-256 hashes of refresh tokens are stored in `dbo.Api_RefreshToken`.
- `POST /api/auth/refresh` rotates the refresh token on every successful use and revalidates active user, CompanyAllow and LocAllow.
- Reuse of an already-rotated/revoked token revokes the whole token family.
- `POST /api/auth/logout` revokes the supplied refresh token.
- `POST /api/auth/logout-all` requires an access token and revokes all refresh sessions for that user/company.
- Run `src/Matrix.Api/sql/001_api_auth.sql` against an existing database to add `Api_RefreshToken` before testing refresh-token endpoints.
