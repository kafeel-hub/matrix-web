# React UGLP v1.4 - Payment + Base Currency

- Restored UGLP Payment Details using the existing Sales Invoice PaymentBreakdownTable.
- Payment rows map to the existing UGLP API payment contract.
- Base currency ID/exchange rate are sent on the UGLP header, even when no payment is entered.
- Legacy UGLP is CREDIT (InvoiceType=1) by default, so payment remains optional; no false full-payment validation is applied.
- Existing v1.3 barcode/manual-weight behavior retained.
- Readback hydrates saved payment rows.
