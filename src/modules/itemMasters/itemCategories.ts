import { createItemMasterHooks } from "./hooks";
import type { ItemMasterFieldDescriptor } from "./ItemMasterMaintenanceView";
import type { ItemCategoryResponse, SaveItemCategoryRequest } from "@/types/itemMasters";

export const itemCategoryHooks = createItemMasterHooks<ItemCategoryResponse, SaveItemCategoryRequest>(
  "item-categories",
  "itemTypeId",
);

export const emptyItemCategory: SaveItemCategoryRequest = {
  categoryId: "",
  name: "",
  nameArabic: "",
  itemTypeId: "",
  prefix: "",
  shortName: "",
  purchaseAccountNo: "",
  salesAccountNo: "",
  salesCostAccountNo: "",
  stockAccountNo: "",
  taxPercent: 0,
  status: 0,
};

export function itemCategoryToSaveRequest(r: ItemCategoryResponse): SaveItemCategoryRequest {
  return {
    categoryId: r.categoryId,
    name: r.name,
    nameArabic: r.nameArabic ?? "",
    itemTypeId: r.itemTypeId,
    prefix: r.prefix ?? "",
    shortName: r.shortName ?? "",
    purchaseAccountNo: r.purchaseAccountNo ?? "",
    salesAccountNo: r.salesAccountNo ?? "",
    salesCostAccountNo: r.salesCostAccountNo ?? "",
    stockAccountNo: r.stockAccountNo ?? "",
    taxPercent: r.taxPercent,
    status: r.status,
  };
}

/**
 * `itemTypeId` needs to be a select of the actual item types that exist,
 * which is data loaded at render time — so this is a function the page
 * calls with that data, rather than a static exported array like the
 * other field lists.
 */
export function buildItemCategoryFields(
  itemTypeOptions: { value: string; label: string }[],
): ItemMasterFieldDescriptor<SaveItemCategoryRequest>[] {
  return [
    { key: "categoryId", label: "Code", type: "text", maxLength: 5, disabledOnEdit: true },
    { key: "name", label: "Name", type: "text", maxLength: 100 },
    { key: "nameArabic", label: "Name (Arabic)", type: "text", maxLength: 100 },
    { key: "itemTypeId", label: "Item type", type: "select", options: itemTypeOptions },
    { key: "shortName", label: "Short name", type: "text", maxLength: 25 },
    { key: "prefix", label: "Prefix", type: "text", maxLength: 20 },
    { key: "purchaseAccountNo", label: "Purchase account", type: "account" },
    { key: "salesAccountNo", label: "Sales account", type: "account" },
    { key: "salesCostAccountNo", label: "Sales cost account", type: "account" },
    { key: "stockAccountNo", label: "Stock account", type: "account" },
    { key: "taxPercent", label: "Tax %", type: "number", step: 0.01 },
    {
      key: "status",
      label: "Status",
      type: "select",
      parseNumber: true,
      options: [
        { value: "0", label: "Active" },
        { value: "1", label: "Inactive" },
      ],
    },
  ];
}
