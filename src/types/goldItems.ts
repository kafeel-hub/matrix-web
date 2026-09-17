// Mirrors Matrix.Api/Models/Items/GoldItemMasterModels.cs
//
// This is the actual inventory item master (GoldItemsController), distinct
// from the lightweight scan/search types in types/catalog.ts (ItemController
// — used by the POS-style New Sale screen and unaffected by this module).

export interface SaveGoldItemRequest {
  itemId?: string | null; // omit to auto-generate via GET /items/next-code
  supplierItemId?: string | null;
  barcode?: string | null; // empty allowed — legacy SP generates one
  name: string;
  nameArabic?: string | null;
  itemTypeId: string;
  categoryId: string;
  subcategoryId?: string | null;
  countryId?: string | null;
  designId?: string | null;
  size?: string | null;
  goldPurity: number;
  openingMakingCost: number;
  averageMakingCost: number;
  currentMakingCost: number;
  supplierCost: number;
  makingCostType: number;
  costPriceType: number;
  salePrice: number;
  goldWeight: number;
  stoneWeight: number;
  supplierId?: string | null;
  purchaseDate?: string | null;
  purchaseTransactionNo: number;
  diamondClarity?: string | null;
  diamondColor?: string | null;
  diamondCut?: string | null;
  piecesStockFlag: number;
  weightPerPiece: number;
  stoneWeightPerPiece: number;
  salePriceType: number;
  goldPriceWeightType: number;
  barcodeFlag: number;
  barcodeSerialNo: number;
  status: number;
}

export interface GoldItemResponse {
  itemId: string;
  supplierItemId?: string | null;
  barcode?: string | null;
  name: string;
  nameArabic?: string | null;
  itemTypeId: string;
  categoryId: string;
  subcategoryId?: string | null;
  countryId?: string | null;
  designId?: string | null;
  size?: string | null;
  goldPurity: number;
  openingMakingCost: number;
  averageMakingCost: number;
  currentMakingCost: number;
  supplierCost: number;
  makingCostType: number;
  costPriceType: number;
  salePrice: number;
  goldWeight: number;
  stoneWeight: number;
  supplierId?: string | null;
  purchaseDate?: string | null;
  purchaseTransactionNo: number;
  diamondClarity?: string | null;
  diamondColor?: string | null;
  diamondCut?: string | null;
  piecesStockFlag: number;
  weightPerPiece: number;
  stoneWeightPerPiece: number;
  salePriceType: number;
  goldPriceWeightType: number;
  barcodeFlag: number;
  barcodeSerialNo: number;
  status: number;
}

export interface GoldItemListResponse {
  itemId: string;
  name: string;
  nameArabic?: string | null;
  barcode?: string | null;
  categoryId: string;
  subcategoryId?: string | null;
  goldPurity: number;
  status: number;
}

export interface GoldItemSaveResponse {
  itemId: string;
  barcode?: string | null;
  created: boolean;
  message: string;
}

export interface NextGoldItemCodeResponse {
  itemId: string;
}
