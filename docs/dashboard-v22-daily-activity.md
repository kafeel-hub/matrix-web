# Dashboard v22 - Daily Activity expansion

`GET /api/dashboard?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD`

v22 keeps the v21.5 core movement dashboard and adds read-only equivalents of the legacy Daily Activity calculations. It intentionally does not execute `SP_Rpt_DailyActivityReport` or other report procedures that mutate shared `Temp*` tables.

New response sections:
- `salesSummary`: K-Net/card, credit, exchange-gold, discount, advance deducted.
- `scrapPurchase`: weight, pure weight, value, cost, profit (`cost - value`, matching legacy).
- `receipts`: cash received and K-Net received.
- `outflows`: cash purchase, payments, K-Net payments, expenses.
- `goldPurchases`: fixed purchase and purchase-fixing weight/amount.
- `orders`: legacy CORD order weight/amount mapping.
- `positions`: hierarchy-based cash, bank and gold opening/debit/credit/closing.
- `cashAccount`: the previous single `LocCashAct` position, renamed to avoid confusing it with Daily Activity cash position.

The existing `sales`, `purchases`, `payments`, and `stock` sections remain.
