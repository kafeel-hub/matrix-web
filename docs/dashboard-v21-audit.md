# v21 Dashboard audit and endpoint

## Legacy sources audited
- `FrmActDashboard1/2/3.vb` call `SP_Act_Dashboard` with CompanyId, LocId, active financial year, Date1, Date2 and GoldRate, then read `TempDashboard`.
- `ClsReportDaily.rptDay_DailyReport` calls `SP_Rpt_DailyReport` and consumes its single summary row plus Crystal report detail data.
- `ClsReportDaily.rptDay_DailyActivityReport` calls `SP_Rpt_DailyActivityReport`; its summary includes scrap, sales/payment split, receipts, purchases, expenses, fixing, order, cash/bank and gold positions.
- `ClsReportDaily.rptDay_SalesSummary` calls `SP_Act_ReportSalesSummary` and reads `TempSalesSummary`.

## v21 design decision
The API does **not** execute the legacy dashboard/report procedures because they delete/write shared physical Temp* tables. That is unsafe when the desktop application and multiple API requests run concurrently. v21 reproduces the core dashboard aggregations as read-only parameterized SQL against the same legacy views/tables.

## Endpoint
`GET /api/dashboard?dateFrom=2026-09-17&dateTo=2026-09-17`

Context is server controlled from JWT + `X-Tenant-Key`: CompanyId, LocationId, UserNo and active financial year are never accepted from the query string.

Authorization: `Finance` policy.

If dates are omitted, both default to today. v21 returns sales, purchases, payment-method mix, Gold/Silver/Diamond stock positions and cash position. Further daily-report metrics can be added after real-DB validation of this first endpoint.
