# v14 Gold Item Master

Built from the legacy `FrmGoldInventItem1` + `ClsInventory.Gold_ItemSave` + SQL `SP_Gold_SaveItemInfo` flow.

## Endpoints
- `GET /api/items?search=&itemTypeId=&categoryId=&subcategoryId=&page=1&pageSize=50`
- `GET /api/items/{itemId}`
- `GET /api/items/next-code?itemTypeId=...&categoryId=...&subcategoryId=...`
- `POST /api/items`
- `PUT /api/items/{itemId}`
- `DELETE /api/items/{itemId}` (safe deactivate: `Prod_Status=1`)

Existing sales endpoints `GET /api/items/scan/{itemCode}` and `GET /api/items/search?term=...` are retained.

## Important legacy behavior retained
- Company and Location are server-controlled from authenticated context.
- Financial year and SysUser are server-controlled.
- Save uses `SP_Gold_SaveItemInfo` rather than reimplementing its side effects.
- The SP maintains `Invent_ItemFile`, `Invent_ItemBarcode`, auto-adds missing purity where legacy permits, creates `Invent_ItemStock` rows across locations, and queues `G_ITM` server update tracking.
- Empty barcode is allowed so the legacy SP can generate it.
- Item code can be omitted on POST; API generates the next legacy-style code from Item Type/Category/Subcategory prefixes and `App_ItemBarcodeDigit`.
- PUT never changes the route Item ID.
- Image is intentionally not included in v14 JSON; legacy BLOB/image handling should be a separate binary endpoint rather than base64 in the core item contract.

## Validation
The API validates Item Type, Category relationship, optional Subcategory relationship, Purity, Design, Country, Supplier, and basic weight rules before calling the legacy save SP.
