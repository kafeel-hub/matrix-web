# v18 - Sales / Purchase Gold Fixing Vouchers

Legacy audit basis:
- Sales: `FrmGoldFixingSale1/2.vb`, transaction type `GFS`.
- Purchase: `FrmGoldFixingPur1/2.vb`, transaction type `GFP`.
- Both call `ClsInventory.Gold_SaveTranGoldFixing`.
- Legacy master SP: `SP_Gold_Tran_SaveTranGoldFixing` -> `TranGoldFix`.
- Payment routine: `Save_TranPaymentFixing` -> `SP_Tran_Save_TranPaymentCheque`.
- Posting: `SP_Gold_SavePostingLedger_GoldFixing`.

The web implementation preserves the current Matrix DB behavior while intentionally excluding legacy `dbGold` synchronization. The master and payment current-DB writes are reproduced transactionally, then the authoritative posting SP is called in the same transaction.

Gold calculations follow the legacy forms: pure weight = weight * purity / company base pure purity; gold amount = weight * rate; local values = FC values * exchange rate; total = gold amount + making amount.

Legacy Sales rule preserved: making charge cannot be left on credit, so a positive making amount requires payment rows. If payment rows are absent in other allowed cases, the configured credit payment type is inserted, matching `Save_TranPaymentFixing`.
