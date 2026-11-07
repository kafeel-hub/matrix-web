# React v2.7 - Journal Voucher
- Added Journal Voucher entry/list screen under Transactions.
- Screen permission uses authoritative legacy Screen_No 030204.
- Supports per-line account, currency/rate, foreign/local debit-credit, Gold/Silver debit-credit and narration.
- Gold/Silver mode is header-level and locked after voucher creation.
- Save is enabled only when local amount and metal totals balance; API repeats authoritative validation.
- Posted vouchers are read-only; Add/Edit/Delete buttons honor legacy permissions.
