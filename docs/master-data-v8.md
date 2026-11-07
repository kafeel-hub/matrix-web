# Master Data v8

Adds Payment Type, Currency, Country, Area and Salesman master APIs, plus Customer/Supplier soft-delete.

All five master controllers require the Administration module (`MasterData` policy). Company/location are taken from authenticated context, never from request payload.

## Routes
- `/api/payment-types`
- `/api/currencies`
- `/api/countries`
- `/api/areas`
- `/api/salesmen`

Each supports GET list, GET by id, POST (legacy upsert semantics), and PUT by id. Physical DELETE is intentionally not implemented for these simple masters in this phase.

Customer/Supplier `DELETE` now performs a soft delete by setting `rfParty.Prt_Status=1` and the linked `Act_Account.Account_Status=1`. No accounting/history rows are removed.

## Legacy compatibility
Writes use `SP_SaveCode_PaymentType`, `SP_SaveCode_Cur`, `SP_SaveCode_Country`, and `SP_SaveCode_SalesMan`.

Area is the deliberate exception: the supplied legacy `SP_SaveCode_Area` hard-codes `CompanyId=1` for existence checking and updates `rfArea` without a CompanyId predicate. The API therefore uses a company-scoped parameterized Dapper upsert for `rfArea` to avoid cross-company updates. This also persists `AreaCountryId`, which the legacy procedure does not accept.

## Authentication addition in this build
This v8 build also adds rotating refresh tokens. Existing databases must run `src/Matrix.Api/sql/002_refresh_tokens.sql` once before starting/testing this build.
