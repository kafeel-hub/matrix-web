# React V2.10 - Wastage Voucher

- Added Finance Wastage Voucher (`WST`) screen using the approved green transaction layout.
- Preserved the current legacy permission mapping internally (`060203`); the screen number is not displayed in the UI.
- Added create, readback, edit, delete and WST list workflows.
- Wastage Amount is derived from Wastage Weight x Gold Rate.
- Save is disabled after successful save/readback and is enabled only for a valid changed voucher.
- No separate posting action was introduced because the legacy WST save creates the stock transaction directly.
- New/modified source follows the repository formatting rules.
