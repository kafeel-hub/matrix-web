# Sales Invoice v3.2 - List and readback

- Preserves the approved Invoice Details list and Invoice Summary UI.
- GSAL list now calls the new authenticated `GET /api/sales-invoices?date=...` endpoint.
- Opening a GSAL invoice now calls `GET /api/sales-invoices/{transactionNo}`.
- Uses the existing centralized JWT/refresh/tenant session handling.
- Company/location/year are not sent from the browser for these reads.
- Existing non-GSAL query tabs are intentionally not migrated by this Sales-only iteration.
