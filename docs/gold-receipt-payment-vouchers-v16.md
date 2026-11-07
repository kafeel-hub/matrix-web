# v16 Gold Receipt / Gold Payment Voucher legacy audit

Authoritative legacy screens:
- `Forms/GL/FrmActVrReceipt2.vb` when `appPayRecVoucherType = 1`
- `Forms/GL/FrmActVrPayment2.vb` when `appPayRecVoucherType = 1`
- `MatrixGoldLibrary/Classes/ClsAccount.vb::SaveVoucherHeadWithFixing`
- SQL `dbo.SP_Act_SaveVoucherWithFixing`

## Confirmed behavior
Both screens remain accounting voucher types `RV` and `PV`. They are not new database transaction types. The distinguishing legacy path is `SaveVoucherHeadWithFixing` -> `SP_Act_SaveVoucherWithFixing`.

Receipt2 sends fixed gold weight/rate/amount and monetary payment rows. Payment2 sends the same fixed-gold fields plus pay-gold purity, pay-gold weight and pay-gold remarks. Both call `SP_Act_SavePostingLedger_Voucher` after save.

`SP_Act_SaveVoucherWithFixing` upserts `Act_Voucher`, persists pay-gold values on the voucher, recreates `TranGoldFix` when FixedGold > 0 (purity hard-coded to 999 by the legacy SP), clears stale detail/payment/ledger/transaction rows, and registers server update/audit activity.

The SP clears `TranPayment`; therefore the API writes the current Matrix DB payment rows after the SP in the same SQL transaction. As in v15, the retired optional `dbGold` synchronization is not invoked.

## API
- POST `/api/gold-receipt-vouchers`
- POST `/api/gold-receipt-vouchers/{voucherNo}/post`
- POST `/api/gold-payment-vouchers`
- POST `/api/gold-payment-vouchers/{voucherNo}/post`

Company, location, financial year, user, voucher type and new-voucher numbering are server controlled.
