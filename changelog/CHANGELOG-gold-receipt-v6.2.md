# Gold Receipt v6.2
- Restored the approved item-based Gold Receipt screen instead of the incorrect fixing/RV layout.
- Transaction type is GR.
- Restored Add Item popup and formulas: deduction weight/percentage two-way calculation, net weight, pure weight.
- Added divide-by-zero protection when deduction weight is entered before gross weight.
- Save now posts header + item lines + payment rows to the new /api/gold-receipt-vouchers endpoint.
- Gold transaction list maps GR to Gold Receipt; GI is reserved for Gold Payment.
