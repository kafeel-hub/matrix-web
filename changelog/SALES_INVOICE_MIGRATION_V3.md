# Sales Invoice migration v3

This iteration migrates the approved GSAL Sales Invoice screen to the new Matrix ASP.NET Core API without redesigning the UI.

## New API integration
- Item type-ahead search: `GET /api/items/search?term=...`
- Item load/scan: `GET /api/items/scan/{itemCode}`
- Existing retail customer lookup: `GET /api/customers/search?civilId=...` or `mobileNo=...`
- Save + legacy posting: `POST /api/sales-invoices`
- Uses the authenticated tenant/JWT session established by Login -> Context Selection.
- Refresh-token rotation/retry is retained for Sales requests.

## Preserved UI/behavior
- Existing Sales Invoice layout and styling.
- Existing customer fields, item dialog/grid, Payment Details, KYC Details, discount/remarks, Save/List/Clear controls.
- Existing client-side price/amount calculations and validation flow.

## Security/context
Tenant, Company, Location, Financial Year and authenticated user are not accepted from editable Sales UI fields. The backend resolves them from the authenticated context.

## Backend companion
Deploy the companion `matrix-api-tested-baseline-v23-5-sales-invoice-ui-contract.zip` before testing this frontend. It wires the existing Sales KYC/passport/profession fields into the already-used legacy master procedure and returns richer retail-customer lookup data.

## Scope note
The Sales create/save/post path is migrated in this iteration. The existing List/Invoice Details and Print workflows are intentionally not declared migrated yet; they need dedicated read/print API contracts rather than reusing the old migration API.
