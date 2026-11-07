# Application Popup Standardization v1

- Replaced active native browser `alert()` usage with the application's existing `Popup` component in all screens where native alerts were still active.
- Gold Receipt Voucher and Gold Payment Voucher now use the application OK-only popup for save success, posting-attention, validation, load errors, and save errors.
- Also standardized the remaining active native alerts in Sale Gold Fixing Voucher, Purchase Gold Fixing Voucher, Gold Unfixed Purchase, and Gold Unfixed Sale.
- Existing confirmation/delete application popups are unchanged.
- No API, persistence, voucher calculation, save payload, or readback logic was changed.
