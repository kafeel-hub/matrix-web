# Gold Receipt Voucher v6.1

- Rebuilt Gold Receipt Voucher from the tested Receipt Voucher screen instead of the old inventory/item-entry implementation.
- Uses /api/gold-receipt-vouchers endpoints.
- Reuses proven Payment Type -> mapped Account -> Currency popup behavior.
- Adds legacy Gold Fixing/Closing values: Gold Weight (999), Gold Rate and Fixing Amount to save payload/readback.
- Adds Gold Receipt list/readback integration through the existing GI tab.
