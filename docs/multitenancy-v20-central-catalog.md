# v20 - Central tenant catalog (BestoJewelGlobal)

## Runtime flow

1. Client sends `X-Tenant-Key`, e.g. `005`.
2. API opens only the configured `TenantCatalog` connection (`BestoJewelGlobal`).
3. `SqlTenantCatalog` queries `dbo.Api_Tenant` by `TenantKey`.
4. Disabled tenants are rejected before any Matrix tenant DB connection is opened.
5. The resolved tenant connection string is placed in the request-scoped `ITenantContext`.
6. The existing `ISqlConnectionFactory` opens that tenant's Matrix database.
7. Login and all repositories therefore execute against the selected tenant database.
8. JWT still contains `tenant_id`; token validation rejects use with a different `X-Tenant-Key`.

`CompanyId` and `LocationId` remain ERP context inside the selected tenant DB. They never select a physical database.

## Central database setup

The existing `003_tenant_catalog.sql` created `dbo.Api_Tenant`. Run `004_tenant_catalog_v20.sql` in **BestoJewelGlobal** to add `TenantConnectionString`.

For the current Windows/on-prem setup a row can use an integrated-security connection string, for example:

```sql
UPDATE dbo.Api_Tenant
SET TenantConnectionString = N'Server=202.66.172.121,1633;Database=TENANT_MATRIX_DB;Trusted_Connection=True;TrustServerCertificate=True',
    ModifiedAtUtc = SYSUTCDATETIME()
WHERE TenantKey = N'005';
```

The client never receives this value. It sends only `X-Tenant-Key: 005`.

`ConnectionStringName` is retained as a migration fallback. If `TenantConnectionString` is null, v20 can still resolve the named connection from `appsettings.json`. New tenants should use `TenantConnectionString` so onboarding does not require an appsettings change or API restart.

## appsettings.json

Only the central catalog connection is required for tenant routing:

```json
"ConnectionStrings": {
  "TenantCatalog": "Server=202.66.172.121,1633;Database=BestoJewelGlobal;Trusted_Connection=True;TrustServerCertificate=True"
}
```

There is no longer a `Tenancy:Tenants` dictionary.

## Caching

Catalog rows are cached in-process for 60 seconds by default (`Tenancy:CacheSeconds`). Set it to `0` while testing if you want every request to query BestoJewelGlobal immediately. A disabled/changed tenant may otherwise remain cached for at most the configured interval.

## Security boundary

The central catalog is server-side infrastructure. Tenant connection strings are never accepted from HTTP headers or request bodies. The public tenant key is only a lookup key. JWT tenant binding from v19 remains active.
