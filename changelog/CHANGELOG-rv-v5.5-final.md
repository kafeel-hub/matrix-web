# RV v5.5 - final vertical slice

Requires Matrix API v23.15.

Added:
- RV list in the existing transaction list screen.
- RV list button now opens the real RV list instead of the temporary placeholder.
- Selecting an RV from the list opens /reciept-voucher/{voucherNo} and reads the saved voucher back from the new API.
- Header and payment lines are reconstructed from persisted data.
- Saved/readback vouchers are protected from accidental duplicate POST from the same screen.
- Existing v5.4 Payment Type -> mapped Account and base Currency behavior retained.
- Full src JS/JSX Babel parse check: 0 syntax errors.
