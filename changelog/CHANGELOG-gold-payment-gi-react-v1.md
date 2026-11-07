# Gold Payment Voucher / GI React v1

Built from the frozen GRV readback React baseline.

- Added dedicated `goldPaymentVoucherApi.js` using `/api/gold-payment-vouchers`.
- Rebuilt `GoldPaymentVoucher.jsx` on the frozen GRV lookup/payment/readback architecture.
- Uses GI Type-2 semantics (`App_GoldIsuRecVchType = 2`): no salesman requirement, `paymentFrom=1`, item rate defaults from `averageMakingCost` when item sale rate is not used by the GI Type-2 flow, and item amount is `grossWeight * rate`.
- Keeps request quantities/weights positive; API/SP owns outward/ledger signs.
- Preserves payment type ID, resolved account, currency CurId, exchange rate and cheque contract.
- Added `/goldpayment-voucher/:id?` route for list readback.
- Wired Gold Data `GI` tab to the new list endpoint and Action to `/goldpayment-voucher/{transactionNo}`.
- Frozen Gold Receipt Voucher source was not modified.
