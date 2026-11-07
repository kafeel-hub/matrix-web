# React V2.12.2 - Trial Balance lookup session fix

- Fixed Trial Balance lookup request passing the request options as the POST body, leaving the request options argument undefined.
- Added the correct authenticated GET helper for `GET /api/finance-statements/trial-balance/lookups`.
- Preserved token refresh and tenant headers for the lookup request.
- No Trial Balance or Profit & Loss calculation/report payload behavior changed.
