# v13 Item Supporting Masters

Built from the validated v12 PCV baseline.

Endpoints (Inventory module authorization):
- /api/item-types
- /api/item-categories?itemTypeId={id}
- /api/item-subcategories?categoryId={id}
- /api/gold-purities
- /api/item-designs

Each master supports GET list, GET by id, POST upsert/create, PUT update, and DELETE soft-deactivate (status=1).

Legacy compatibility notes:
- Item Type is company-scoped and includes its four accounting mappings.
- Category is location-backed but legacy save propagates a category to all company locations; v13 preserves that behavior without calling SP_UpdateServerTransaction.
- Subcategory is location-scoped. v13 intentionally does NOT call SP_SaveCode_ItemSubCat because that procedure can auto-create Watch items/barcodes/stock as a side effect. The API master endpoint only maintains the subcategory master record.
- Gold Purity is company-scoped.
- Item Design is company-scoped. v13 uses a company-scoped direct upsert because the legacy design procedure's UPDATE omits CompanyId and does not update DesignStatus.
- CompanyId and LocationId come from IUserContext.
- Account mappings are validated as postable accounts for the authenticated company/location.
