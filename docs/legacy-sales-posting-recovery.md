# GSAL posting recovery

The legacy desktop application commits `TranMast`, `TranDetail`, and `TranPayment` before calling `Gold_TranPostingLedger`. A posting error therefore leaves a saved but unposted invoice.

This baseline adds `POST /api/sales-invoices/{transactionNo}/post` so an already committed invoice can be posted again without creating a duplicate invoice.

Posting now resolves the persisted `TranMast.TranPosNo` instead of assuming zero, then calls `SP_Gold_SavePostingLedgerItem1`. SQL Server errors are returned as `POSTING_SQL_ERROR` so configuration/data problems can be diagnosed from the API response.

A 120-second command timeout is used for this legacy posting stored procedure.
