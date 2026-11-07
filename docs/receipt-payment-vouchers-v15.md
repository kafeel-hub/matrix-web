# v15 Receipt Voucher (RV) + Payment Voucher (PV)

Audited legacy forms: `FrmActVrReceipt1.vb`, `FrmActVrPayment1.vb`, `ClsAccount.SaveVoucherHead`, `ClsInventory.Save_TranPaymentVoucher` and SQL posting procedure `SP_Act_SavePostingLedger_Voucher`.

Both screens save an `Act_Voucher` master through `SP_Act_SaveVoucher_VSubType`, pass an empty voucher-detail table, and the legacy desktop saves payment rows through `SP_Tran_Save_TranPaymentVoucher` in the same SQL transaction. The API reproduces that procedure's current-database `TranPayment` upsert directly because the legacy procedure also performs the explicitly excluded `dbGold` synchronization. Posting occurs after commit through `SP_Act_SavePostingLedger_Voucher`.

The main account is written to both `v_AccountNo` and `v_ContraActNo`. Total/received amount is the sum of payment rows. Base currency and exchange rate 1 are used on the voucher master. Payment rows retain their own payment type, account, currency/exchange rate, foreign amount, cheque bank/no/date.

RV posting debits receipt/payment-method accounts and credits the selected voucher account. PV posting credits payment-method accounts and debits the selected voucher account. The direction is controlled only by the server-forced voucher type; clients cannot submit it.

Endpoints:
- POST `/api/receipt-vouchers`
- POST `/api/receipt-vouchers/{voucherNo}/post`
- POST `/api/payment-vouchers`
- POST `/api/payment-vouchers/{voucherNo}/post`

CompanyId, LocationId, FinancialYear, UserNo, voucher type/subtype, voucher number/new-voucher flag, base master currency/exchange rate and totals are server-controlled.

The legacy SPs contain optional `dbGold` synchronization. The API does not change global database flags. If the posting SP throws after current-database ledger rows are already complete and balanced, the repository verifies local posting before treating the old-database failure as non-fatal.
