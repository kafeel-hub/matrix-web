// Mirrors Matrix.Api/Models/Masters/ItemMasterModels.cs

export interface ItemTypeResponse {
  itemTypeId: string;
  name: string;
  nameArabic?: string | null;
  prefix?: string | null;
  purchaseAccountNo?: string | null;
  salesAccountNo?: string | null;
  salesCostAccountNo?: string | null;
  stockAccountNo?: string | null;
  stockFlag: number;
  isDefault: number;
  purePurity: number;
  nature: number;
  status: number;
}
export interface SaveItemTypeRequest {
  itemTypeId: string; // max 2
  name: string; // max 50
  nameArabic?: string | null; // max 50
  prefix?: string | null; // max 1
  purchaseAccountNo?: string | null; // max 25
  salesAccountNo?: string | null; // max 25
  salesCostAccountNo?: string | null; // max 25
  stockAccountNo?: string | null; // max 25
  stockFlag: number;
  isDefault: number;
  purePurity: number;
  nature: number;
  status: number;
}

export interface ItemCategoryResponse {
  categoryId: string;
  name: string;
  nameArabic?: string | null;
  itemTypeId: string;
  prefix?: string | null;
  shortName?: string | null;
  purchaseAccountNo?: string | null;
  salesAccountNo?: string | null;
  salesCostAccountNo?: string | null;
  stockAccountNo?: string | null;
  taxPercent: number;
  status: number;
}
export interface SaveItemCategoryRequest {
  categoryId: string; // max 5
  name: string; // max 100
  nameArabic?: string | null; // max 100
  itemTypeId: string; // max 2, required — which item type this category belongs to
  prefix?: string | null; // max 20
  shortName?: string | null; // max 25
  purchaseAccountNo?: string | null; // max 30
  salesAccountNo?: string | null; // max 30
  salesCostAccountNo?: string | null; // max 30
  stockAccountNo?: string | null; // max 30
  taxPercent: number;
  status: number;
}

export interface ItemSubcategoryResponse {
  subcategoryId: string;
  name: string;
  nameArabic?: string | null;
  categoryId: string;
  prefix?: string | null;
  status: number;
}
export interface SaveItemSubcategoryRequest {
  subcategoryId: string; // max 8
  name: string; // max 100
  nameArabic?: string | null; // max 100
  categoryId: string; // max 5, required — which category this subcategory belongs to
  prefix?: string | null; // max 20
  status: number;
}

export interface GoldPurityResponse {
  purityNo: number;
  description: string;
  descriptionArabic?: string | null;
  deductionPercent: number;
  status: number;
}
export interface SaveGoldPurityRequest {
  purityNo: number; // 0.001–999999 — this IS the primary key (decimal, not a code)
  description: string; // max 25
  descriptionArabic?: string | null; // max 25
  deductionPercent: number;
  status: number;
}

export interface ItemDesignResponse {
  designId: string;
  name: string;
  nameArabic?: string | null;
  prefix?: string | null;
  status: number;
}
export interface SaveItemDesignRequest {
  designId: string; // max 3
  name: string; // max 100
  nameArabic?: string | null; // max 100
  prefix?: string | null; // max 5
  status: number;
}
