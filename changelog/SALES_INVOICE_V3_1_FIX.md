# Sales Invoice v3.1 render fix

- Fixes `ReferenceError: dynamicFields is not defined` in `src/pages/Home.jsx`.
- Restores the dynamic item-entry labels already used by the approved transaction UI:
  - Unit Price/gm vs Unit Price/Pcs
  - MC Per Gm vs MC Per Pcs
- No API contract, authentication, context-selection, dashboard, transaction calculation, or visual-layout changes.
