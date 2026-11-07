# v19 - Database-per-tenant multitenancy

## Boundary
Tenant is an infrastructure/database boundary. It is intentionally independent from ERP `CompanyId` and `LocationId`.

`CompanyId` and `LocationId` continue to mean business context inside one Matrix database. They never select a tenant database.

## Request resolution
Every `/api` request supplies `X-Tenant-Key` (configurable under `Tenancy:HeaderName`). The key is resolved against the server-side tenant registry. Clients never submit a database name, SQL server, SQL user, password, or connection string.

Example:

```http
X-Tenant-Key: plaza
Authorization: Bearer <token>
```

Login, context selection, refresh and logout use the same tenant header because pre-auth tickets, credentials, lockout state and refresh-token sessions live in that tenant database.

## JWT isolation
Authenticated tokens contain a `tenant_id` claim. JWT validation rejects a token when its `tenant_id` differs from the request's resolved tenant. This prevents a valid token issued by tenant A from being replayed against tenant B.

`IUserContext.TenantId` exposes the authenticated tenant to application code. Module-permission cache keys also include TenantId, preventing rights cached for one database from leaking into another tenant with the same CompanyId/GroupNo.

## Connection routing
`ISqlConnectionFactory` is request-scoped and opens only the connection string registered for the resolved tenant. Existing repositories remain unchanged and therefore automatically use the correct tenant database.

This is database-per-tenant routing. It does **not** use `Sys_Location.LocDbSource`, `LocDbName`, `LocDbUser`, `LocDbPwd`, CompanyId, or LocationId to switch databases.

## Configuration
Development example:

```json
"ConnectionStrings": {
  "Matrix_PLAZA": "...",
  "Matrix_CLIENT2": "..."
},
"Tenancy": {
  "HeaderName": "X-Tenant-Key",
  "RequireHeader": true,
  "Tenants": {
    "plaza": { "ConnectionStringName": "Matrix_PLAZA", "Enabled": true },
    "client2": { "ConnectionStringName": "Matrix_CLIENT2", "Enabled": true }
  }
}
```

For production, keep actual connection-string values in environment variables / secret configuration rather than source-controlled appsettings, for example `ConnectionStrings__Matrix_PLAZA`.

## Migration path
1. Deploy the same API build for all tenants.
2. Register each tenant key and its separate Matrix connection string.
3. Ensure each tenant database contains the API support tables/migrations already used by authentication (`Api_UserCredential`, login security, pre-auth nonce, refresh token tables).
4. Client selects/knows its tenant before login and sends the tenant header on every API request.
5. Company/location selection remains exactly as today, but occurs only after the tenant database has been selected.

No existing Matrix ERP tables need a `TenantId` column for this model.
