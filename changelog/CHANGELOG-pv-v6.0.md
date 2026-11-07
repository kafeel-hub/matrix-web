# PV v6.0

Payment Voucher is rebuilt from the tested RV v5.5 vertical slice.

- New API service for /payment-vouchers.
- PV lookup/payment popup reuses Payment Type -> mapped Account and base Currency behavior.
- PV save/post uses the new controller API.
- Added PV list tab and PV readback route /payment-voucher/:id.
- Added Paid Account / Paid To labels without changing RV labels.
- Preserves payment edit/delete, multiple rows, currency/exchange rate, cheque fields and duplicate-save protection from RV.
