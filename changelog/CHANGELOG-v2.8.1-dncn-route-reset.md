# React V2.8.1 - Debit/Credit Note Route Reset Fix

- Fixed shared Debit/Credit Note component retaining the previous voucher state when switching between Debit Note and Credit Note routes.
- Changing DN/CN route now resets voucher number, reference, date, accounts, balances, currency/rate, remark, detail rows, edit row state, messages and posting/list dialogs before loading any route voucher.
- Existing saved voucher readback remains supported when navigating directly to a DN/CN voucher route.
- No API or database changes.
