# Customer/Supplier React migration v1.1 — Area lookup fix

Runtime feedback confirmed Customer and Supplier save successfully.

Fix:
- Changed Area/Region from free-text `CustomInput` to `CustomSelect` in both existing forms.
- Uses the already-loaded context-selection/bootstrap `area` lookup (`data.area`).
- Option value is `fldID` (AreaId); display text is `fldDisplay`.
- Existing form field remains `clAreaId`, so save continues mapping it to API `areaId`.
- No API/backend change.
- No layout or other UI/UX changes.
