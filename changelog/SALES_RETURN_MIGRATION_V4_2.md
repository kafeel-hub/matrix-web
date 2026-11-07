# Sales Return migration v4.2
- Preserved existing Return Invoice UI.
- Replaced legacy return save payload with typed POST /api/sales-returns.
- Replaced against-invoice lookup with authenticated GSAL original-invoice endpoints.
- Mobile/Civil ID original-invoice search now uses the new API.
- Item search/scan uses the authenticated item API.
- Removed hardcoded Company/User/Civil ID/Gold Rate/test barcode/cheque/account values from the active save path.
- Tenant/company/location/year/user remain server-owned.
