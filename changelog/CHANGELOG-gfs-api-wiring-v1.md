# GFS API wiring v1

- Wired Sales Gold Fixing Voucher to dedicated GFS lookups, supplier list/detail, save and readback APIs.
- Reused the proven GR/GP payment popup contract and application Popup messaging.
- GFS supplier selector is supplier-only.
- Gold purity options are supplied by the GFS lookup endpoint (legacy 999, 999.9, 995, 1000).
- Added GFS list loading to Gold Data and Action -> /salegoldfixing-voucher/{voucherNo} readback navigation.
- GFS has no item API or item-line persistence.
- Existing GR, GP/GI, RV and PV pages were not modified.
