# Legacy Sales Validation Audit and Merge Notes

This merge keeps the authentication/authorization design from the Matrix API baseline and imports the Sales vertical-slice work from `MatrixGold.Api.v0.5` only where it was verified against the legacy VB.NET application and SQL schema/procedures.

## Legacy sources reviewed

- `MatrixPro/Forms/Sales/Gold/FrmGoldSalesInv10.vb`
- `MatrixGoldLibrary/Classes/ClsInventory.vb` (`Gold_SaveTranMast`)
- `MatrixGoldCommon/ah_Functions.vb`
  - `ah_CheckDateFinancePeriod`
  - `ah_CheckDateClose`
  - `ah_CheckPrevDateEditAllow`
  - `ah_checkBlackListedValidiy`
  - `ah_checkCashPurchaseValidiy`
- `MatrixGoldLibrary/Classes/ClsSales.vb`
  - cash/credit customer lookup functions
- database script `matrixscript.sql`
  - `rfCustomerInfo`
  - `Invent_ItemFile`
  - `Sys_UserCompanyYear`
  - `Sys_CloseDate`
  - `Sys_CloseYear`
  - `Sys_CompanyPara`
  - `SP_Gold_Tran_SaveTranMastForAll`
  - `sp_Select_Customer`

## Preserved from the secure baseline

- legacy + modern password verification/migration
- login failure tracking and lockout
- rate limiting
- one-time Data Protection pre-auth ticket/nonce
- selected-company `Sys_User` row as authoritative user context
- `IUserContext` from trusted JWT claims
- no financial year or module-rights payload in the JWT
- server-side module authorization backed by `Sys_PermGroupsModule`
- rich select-context bootstrap response with lookups
- existing authentication integration tests

## Imported and corrected from v0.5

### Customer search

Endpoints support customer search by Civil ID or mobile/phone. The query is scoped by authenticated `CompanyId` and uses `CustCivilId = @CivilId` rather than the less-readable `CustId = @CivilId`. Existing data may use the same value in both fields, but the explicit Civil ID column matches the business intent.

Legacy `sp_Select_Customer` accepts CompanyId but does not actually filter on it. The modern API intentionally fixes this legacy cross-company risk by applying `CompanyId` in the direct Dapper query.

### Item scan/search

Both scan and search are scoped by authenticated `CompanyId` + `LocationId`, matching the legacy item selection pattern (`CSelectItemInfo(companyId, locId, prodId)`). The client cannot select another company/location through request parameters.

### Financial/date validation

The merged validation reproduces the legacy sequence used by `Gold_SaveTranMast`:

1. active user financial year must exist
2. financial start/end dates must be configured
3. transaction date must be inside that period
4. legacy close-date/future-date behavior is reproduced
5. previous-date permission is checked
6. a closed financial year is explicitly rejected before the stored procedure call

The closed-year validation is also enforced by `SP_Gold_Tran_SaveTranMastForAll`, which checks `Sys_CloseYear` and, where applicable, `Sys_CompanyYear.OpenStatus` and raises an error when status is `CLOSED`.

`Sys_User.user_EditCurrentDateFlag` is read using both `CompanyId` and `emp_no`. The legacy helper queried only by employee number; adding CompanyId is an intentional correctness fix because `Sys_User` is keyed by `(CompanyId, emp_no)`.

The legacy `Sys_CloseDate` helper did not actually filter by company (the predicate was commented out), so the merged compatibility query currently mirrors that behavior. This can be tightened later only after confirming the production data semantics.

### GSAL customer/business validation

For GSAL, the merge reproduces:

- `App_CivilIdMendatory = 0` => Civil ID required
- `App_MobileFlag = 0` => mobile or phone required
- blacklist validation priority: Civil ID, then phone, then exact customer name
- rolling KWD 3000 cash validation using company/location/Civil ID/cash payment type/date period
- `App_3000CashFlag = 2` => hard reject
- `App_3000CashFlag = 1` => API returns a confirmation-required validation error unless `cashLimitConfirmed=true`
- default salesman `01` when a GSAL request does not supply one

The legacy UI allows a new cash customer during invoice entry and can save customer data as part of the legacy flow. Therefore the API does **not** require a pre-existing `rfCustomerInfo` row merely to save a GSAL header.

### Sales master stored procedure

`SalesInvoiceRepository` calls `SP_Gold_Tran_SaveTranMastForAll` through Dapper. The parameter list was compared with the actual SQL procedure: all 107 stored-procedure parameters are supplied, with no missing or extra names.

Server-owned values include:

- transaction type = `GSAL`
- CompanyId from `IUserContext`
- LocationId from `IUserContext`
- UserNo from `IUserContext`
- financial year resolved from `Sys_UserCompanyYear`, not from the JWT or request

Header mappings were corrected to use the request fields for invoice type/against/reference, party type, bilingual name/address components, CR number, area/country, PACI fields, salesman, currency, discounts/tax/charges, etc., within the stored procedure's declared lengths.

## Deliberately not completed in this merge

This milestone retains the tested v0.5 scope: **sales invoice master/header save only**.

The legacy `Gold_SaveTranMast` performs the following as one database transaction:

- save master
- save item details
- save scrap details where applicable
- save payment rows
- commit

Ledger posting occurs after that transaction commits.

`SaveDetailsAsync`, `SavePaymentsAsync`, and `PostLedgerAsync` therefore remain intentionally unimplemented. They must be migrated and validated from the legacy routines before this endpoint is described as a complete invoice-save flow.

Likewise, server-authoritative calculation of every net/discount/tax/charge value should be completed only after the legacy invoice calculation formulas are audited. The current master save derives the detail-based totals it can safely derive, while retaining request fields for values whose legacy formulas have not yet been fully migrated.
