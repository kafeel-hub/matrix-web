# React V2.12 - Trial Balance and Profit & Loss

- Added Trial Balance report screen using `POST /api/finance-statements/trial-balance`.
- Added Profit & Loss report screen using `POST /api/finance-statements/profit-loss`.
- Added Finance permission-aware report menu entries for the existing legacy Trial Balance and P&L permissions.
- Preserved the approved green report UI and financial-year context defaults.
- Added report filters, search, hierarchy-aware result rows, and API-provided totals.
- No accounting calculations are reproduced in React; figures come directly from the tested API/legacy stored-procedure results.
