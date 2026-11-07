# Daily Reports v1 - Daily Activity Detail

- Added Reports > Daily Reports route and menu entry.
- Added reusable Daily Reports shell with report selector, date filters, transaction-type filter and search.
- Added Daily Activity detail renderer grouped by transaction with item-level lines.
- Uses authenticated company/location context; no duplicate report location lookup was introduced.
- Shows detail totals only; dashboard aggregate KPI cards are intentionally not duplicated.
- Uses the frozen green ERP theme (`#00A76F`, `#EFF8F4`).
