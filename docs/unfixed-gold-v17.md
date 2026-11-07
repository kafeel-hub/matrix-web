# v17 - Unfixed Sale / Unfixed Purchase

Legacy audit basis:
- Sales: MatrixPro/Forms/Sales/Gold/FrmGoldSalesUnFixed1.vb (`USAL`)
- Purchase: MatrixPro/Forms/Purchase/Gold/FrmGoldPurUnFixed1.vb (`UGLP`)
- Shared save: `ClsInventory.Unfixed_SaveGoldTranMast`
- Master SP: `SP_Gold_Tran_SaveTranMastForAll`
- Detail SP: `SP_Gold_Tran_SaveUnfixedTranDetail`
- Payment behavior: legacy `Save_TranPayment` / `SP_Tran_Save_TranPayment`
- Posting: `Gold_TranPostingLedger` -> API uses existing `SP_Gold_SavePostingLedgerItem1` recovery pattern.

Key behavior preserved:
- USAL item ledger qty/weight is negative; UGLP is positive.
- Party is mandatory for both transaction types in legacy `Unfixed_SaveGoldTranMast`.
- At least one item is mandatory.
- `ProdUnfixAmt` is persisted on each unfixed detail row.
- Transaction context (company/location/year/user) is server controlled.
- Current-database `TranPayment` upsert mirrors `SP_Tran_Save_TranPayment` but intentionally skips its optional `dbGold` synchronization.
