# React V2.8 - Debit Note / Credit Note

- Adds shared Debit Note (`DN`) and Credit Note (`CN`) transaction UI.
- Preserves legacy screen permission `030204` for both screens.
- Uses separate explicit posting permission `030206`, matching the validated voucher posting flow.
- Provides postable primary/contra account selectors, shared currency/exchange rate, narration/amount detail rows, and foreign/local/grand totals.
- DN labels primary as Debit Account and contra as Credit Account; CN reverses those labels while retaining the same shared component.
- Adds list/readback/edit/delete/post flows with posted voucher locking.
- Reuses existing Account Master balance endpoint for account balance display.
