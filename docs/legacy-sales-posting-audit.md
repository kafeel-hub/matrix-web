# Legacy GSAL posting audit

## Legacy call path

`MatrixGoldLibrary/Classes/ClsInventory.vb` implements `Gold_SaveTranMast(...)` as two distinct phases:

1. begin a SQL transaction;
2. save `TranMast`, sales detail rows, optional scrap rows and payment rows;
3. commit that SQL transaction;
4. call `Gold_TranPostingLedger(...)` **after the commit**.

`Gold_TranPostingLedger(...)` always calls:

```text
SP_Gold_SavePostingLedgerItem1
```

with these six parameters:

```text
@CompanyId
@LocId
@YearNo
@TranType
@TranNo
@TranPosNo
```

For the API GSAL path, `@TranType` is server-forced to `GSAL` and `@TranPosNo` is `0`, matching the API master/detail/payment rows.

## Stored procedure behavior

The database script defines `SP_Gold_SavePostingLedgerItem1` with exactly the same six parameters. For normal transactions it first removes existing matching `Act_Ledger` rows, then rebuilds ledger entries from `TranMast`, `TranDetail`, `TranPayment`, location/company GL setup and related configuration.

For GSAL it handles, among other things:

- credit vs cash invoice posting;
- customer/party ledger entries;
- cash and configured non-cash payment accounts;
- payment/bank charges;
- gold sales, stock and cost-of-sales accounts;
- making-charge sales/cost/stock accounts;
- discounts, delivery/gift/other charges where configured;
- debit/credit and gold debit/credit normalization in `Act_Ledger`.

The procedure finishes by deleting zero-value ledger rows, normalizing debit/credit columns, optionally updating gold transaction balances, and re-raising SQL errors from its `TRY/CATCH` block.

## API implementation

`SalesInvoiceRepository.PostLedgerAsync(...)` now:

1. verifies the committed GSAL `TranMast` exists in the authenticated company/location/year context;
2. calls `SP_Gold_SavePostingLedgerItem1` with the legacy six-parameter contract;
3. verifies that at least one matching `Act_Ledger` row exists;
4. returns `true` only when that verification succeeds.

Posting intentionally runs **outside** the master/detail/payment SQL transaction, preserving the legacy commit boundary. Therefore a posting error leaves the invoice saved and returns `saved=true, posted=false` rather than deleting the invoice.

Successful API response now returns `posted=true`.

## Reposting

The posting stored procedure deletes matching `Act_Ledger` rows before rebuilding them, so retrying posting for the same transaction follows the legacy procedure's existing repost behavior.
