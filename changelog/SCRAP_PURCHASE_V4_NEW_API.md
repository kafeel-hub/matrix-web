# Scrap Purchase v4 - New API integration
- Preserves the approved Scrap Purchase UI.
- Replaces legacy strTransactionTable/strClsInventory/strPaymentTable save payload with typed /api/scrap-purchases request.
- Uses authenticated tenant/JWT session and refresh-token rotation.
- Reuses authenticated customer and item lookup endpoints.
- Removes hardcoded CompanyId, LocationId, YearNo, SysUser, gold rate, cheque/account placeholders from the save path.
- Maps displayed discount/net amount correctly.
- Displays actual SCRAP transaction number returned by the API.
