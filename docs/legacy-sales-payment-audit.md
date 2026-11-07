# Legacy GSAL payment audit

## Scope

This phase was validated against the legacy `FrmGoldSalesInv10` save flow and the payment routines in `MatrixGoldLibrary/Classes/ClsInventory.vb`.

## Confirmed legacy behavior

- `FrmGoldSalesInv10` sets `TranPaymentMethodType = 1`.
- `Gold_SaveTranMast(...)` saves the master, details, optional scrap, and then payment rows inside the same SQL transaction.
- Payment method type `1` routes to `Save_TranPaymentSales(...)`.
- `Save_TranPaymentSales(...)` calls `SP_Tran_Save_TranPaymentSales` once per payment row.
- `PaySrNo` is generated sequentially by the legacy save routine starting at 1.
- Persisted payment fields are: `PayId`, `PayAmt`, `PayCurId`, `PayCurExRate`, `PayCurAmt`, and `PayAuthCode`.
- `SP_Tran_Save_TranPaymentSales` resolves the posting account from payment type/location configuration and falls back to location cash/KNET accounts where needed.
- If `PayCurAmt <= 0`, the stored procedure defaults it to `PayAmt`. If `PayCurId` is blank, it defaults to the company base currency.

## API implementation

The API now saves master + detail + payment rows in one `SqlTransaction`. A failure in any payment line rolls back the master and detail rows as well.

The API intentionally ignores client `LineNo` for persistence and regenerates `PaySrNo` sequentially, matching the legacy routine.

## Still deferred

Ledger/stock posting is not part of this phase, so the API response remains `posted = false`.
