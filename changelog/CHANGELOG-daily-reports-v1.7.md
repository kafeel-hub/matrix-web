# Daily Reports v1.7 - Daily Bank Book

- Adds Daily Bank Book to the unified Daily Reports selector.
- Calls `/api/reports/daily/bankbook` using the common From/To date filters.
- Reuses the tested Cashbook presentation for bank account, financial year, opening/debit/credit/closing, running balance, narration and cheque reference.
- Bank account is resolved by the API from the authenticated location; no account selector is added.
