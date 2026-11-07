# React RV v5.3

- Receipt Voucher now loads its own authenticated payment/currency lookups.
- Header Received Account and Received From use authenticated server-side postable account search.
- Add Payment Account uses the same account search and defaults from selected payment type configuration.
- Currency uses Matrix rfCurrency and defaults to company base currency.
- Base currency uses exchange rate 1; foreign exchange rate remains ERP/user supplied.
- Corrected voucher payment semantics: Amount LC -> PayAmt and Amount FC -> PayCurAmt; FC = LC / exchange rate.
- Preserved existing RV UI.
