# v1.2 Customer Actions fix

Cause:
- CustomerMaster's Actions column rendered an intentionally empty `action-btn-container`.
- SupplierMaster rendered Edit/Delete icons, which is why Supplier showed them and Customer did not.

Fix:
- Customer Actions now visually matches Supplier: Edit + Delete icons.
- Customer Edit is fully integrated:
  GET /api/customers/{id} -> hydrate existing CustomerForm -> PUT /api/customers/{id}.
- Group of Accounts and Area dropdown values hydrate through the existing mapper.
- Delete remains visual-only, matching the current Supplier/old baseline; no delete API behavior was invented.
- No layout/CSS/form structure changes.
