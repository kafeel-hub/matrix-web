# Sales Return v4.3 - GRET List + Readback

Adds authenticated GRET list and readback to the existing Invoice List and Invoice Details screens.

- GET /api/sales-returns?date=YYYY-MM-DD
- GET /api/sales-returns/{transactionNo}
- GRET list uses authenticated tenant/company/location/financial-year context.
- Readback maps persisted TranMast, TranDetail and TranPayment.
- Against Invoice is read from TranMast.TranVrNo.
- Existing Return Save/Post behavior is unchanged.
