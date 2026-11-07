# Legacy sales-detail audit

This phase was implemented against the legacy `MatrixGoldLibrary/Classes/ClsInventory.vb` and `FrmGoldSalesInv10.vb` behavior, plus the stored-procedure definitions in `matrixscript.sql`.

## Confirmed legacy call flow

For `GSAL`, `Gold_SaveTranMast` creates the master and then selects the detail routine from `Sys_CompanyPara.App_SalesInvFormType`:

- `10` or `11` -> `Gold_SaveTranDetail_SaleForm10` -> `SP_Gold_Tran_SaveTranDetail_SaleForm10`
- `9` -> `Gold_SaveTranDetail_SaleForm9` -> `SP_Gold_Tran_SaveTranDetail_SaleForm9`
- `1`, `2`, or `6` -> `Gold_SaveTranDetail_WithOrigin` -> `SP_Gold_Tran_SaveTranDetail_WithOrigin`
- otherwise -> `Gold_SaveTranDetail` -> `SP_Gold_Tran_SaveTranDetail`

The API now preserves this branching instead of hard-coding one procedure.

## GSAL stock direction

The legacy detail routines treat `ProdTranTypeId = 1` as a positive ledger quantity/weight. Other GSAL rows use negative quantity/weight, reducing stock. The API reproduces that behavior.

## Form 10/11 fields

`FrmGoldSalesInv10` supplies `ProdSize`, `ProdCustGold`, and `ProdWasteAmt`. `Gold_SaveTranDetail_SaleForm10` also overwrites repair weight with customer gold (`ProdRepairWgt = ProdCustGold`). These fields are now represented in `SalesInvoiceItemRequest`.

## Common line calculations

The API reproduces the pre-procedure calculations performed by the VB library:

- negative making cost is normalized to zero;
- when net weight is not supplied, it is calculated as `GoldWeight - (DeductionWeight + StoneWeight)`;
- when making rate is zero and net weight is non-zero, it is derived from `MakingAmount / NetWeight`;
- detail sequence is generated server-side from the non-empty item rows;
- invoice item name falls back to the normal item description.

## Transaction boundary

Master and sales-detail lines are now written using the same `SqlConnection` and `SqlTransaction`. If any detail stored-procedure call fails, the master insert is rolled back too. Payment and ledger posting remain intentionally outside this phase and are still not marked as posted.

## Next phase

Audit and implement the legacy payment branching (`Save_TranPayment`, `Save_TranPaymentSales`, `Save_TranPaymentChequeAuthCode`, `Save_TranPaymentCheque`) and then extend the same transaction boundary through payments before ledger posting.
