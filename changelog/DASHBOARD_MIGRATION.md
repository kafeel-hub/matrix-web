# Dashboard migration - new Matrix API

This build keeps the existing dark navy/gold React dashboard UI but replaces hardcoded dashboard figures with the new ASP.NET Core dashboard contracts.

## API endpoints
- `GET /api/dashboard?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD`
- `GET /api/dashboard/analytics?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD&groupBy=day|month`

Set `VITE_MATRIX_API_BASE_URL` to the new API base URL (including `/api`). See `.env.example`.

The dashboard reads the bearer token from Redux using the current `auth.token` and also supports `auth.accessToken`, `auth.authData.accessToken`, or `auth.authData.token` to ease the upcoming authentication migration.

## Implemented
- Existing Overview / Gold & Scrap / Cash Flow / Balances tab design retained.
- Hardcoded dashboard metrics removed from the four tabs.
- Dashboard and analytics endpoints loaded in parallel.
- Period Report date selector is functional.
- Grouping automatically uses `day` for <= 90 days and `month` for longer ranges.
- Client-side 5-year range validation matches the current API policy.
- Loading, API error, refresh and request cancellation handling.
- Overview: gross/net sales, sales weight/qty, discount, MC analytics, management profitability, sales trend, composition and payment mix.
- Gold & Scrap: purchase totals, scrap pure weight/profit, fixed/fixing/scrap mix and purchase trend.
- Cash Flow: K-Net/credit/receipts, money in/out, payment mix, operational outflows, ledger cash/bank movement and closing trends.
- Balances: validated ledger cash/bank/gold opening/movement/closing and continuous balance trend.

## Deliberately unchanged
The rest of the legacy React application's API layer/modules were not migrated. This isolates the dashboard migration and avoids changing Sales, Purchases, Masters, Vouchers, etc. until those frontend modules are migrated individually.
