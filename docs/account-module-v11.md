# Account module v11

Built for Finance screens, starting with Petty Cash Expense (PCV).

## Endpoints

- `GET /api/accounts/petty-cash`
  - Small list for the PCV top "Select Account" control.
  - Uses the legacy cash GL classification (`Sys_CompanyPara.gl_GroupCash`) against the `Act_Account.Account_SerialNo` hierarchy.
  - Only active, postable accounts for the authenticated company/location (including location 0/global accounts).
  - Marks `Sys_Location.LocPettyCashAct` as `isDefault`; falls back to `Sys_CompanyPara.gl_CashAccount` when location petty cash is not configured.

- `GET /api/accounts/search?search=capital&excludeAccountNo=101001002001&page=1&pageSize=25`
  - Large server-side search for PCV detail/item account selection and future Finance screens.
  - Searches account number and English account name.
  - Active + postable accounts only.
  - `excludeAccountNo` supports the PCV legacy rule that prevents choosing the selected cash account as a detail account.
  - `pageSize` range: 1-100.

- `GET /api/accounts/{accountNo}`
  - Full account lookup plus current balance.
  - Uses legacy `SP_Act_SelectAccountAll` so `Print_CloseAmt` / `Print_CloseType` match the desktop application's balance path.

- `GET /api/accounts/{accountNo}/balance`
  - Lightweight balance response for the PCV "Current Balance" card.

## Security/context

All endpoints require the Finance module policy. CompanyId, LocationId, UserNo and active financial year are server-side context; none are accepted from the client.
