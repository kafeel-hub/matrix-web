import { createItemMasterHooks } from "./hooks";
import type { ItemMasterFieldDescriptor } from "./ItemMasterMaintenanceView";
import type { ItemSubcategoryResponse, SaveItemSubcategoryRequest } from "@/types/itemMasters";

export const itemSubcategoryHooks = createItemMasterHooks<
  ItemSubcategoryResponse,
  SaveItemSubcategoryRequest
>("item-subcategories", "categoryId");

export const emptyItemSubcategory: SaveItemSubcategoryRequest = {
  subcategoryId: "",
  name: "",
  nameArabic: "",
  categoryId: "",
  prefix: "",
  status: 0,
};

export function itemSubcategoryToSaveRequest(r: ItemSubcategoryResponse): SaveItemSubcategoryRequest {
  return {
    subcategoryId: r.subcategoryId,
    name: r.name,
    nameArabic: r.nameArabic ?? "",
    categoryId: r.categoryId,
    prefix: r.prefix ?? "",
    status: r.status,
  };
}

/** `categoryId` needs the loaded category list, same reasoning as buildItemCategoryFields. */
export function buildItemSubcategoryFields(
  categoryOptions: { value: string; label: string }[],
): ItemMasterFieldDescriptor<SaveItemSubcategoryRequest>[] {
  return [
    { key: "subcategoryId", label: "Code", type: "text", maxLength: 8, disabledOnEdit: true },
    { key: "name", label: "Name", type: "text", maxLength: 100 },
    { key: "nameArabic", label: "Name (Arabic)", type: "text", maxLength: 100 },
    { key: "categoryId", label: "Category", type: "select", options: categoryOptions },
    { key: "prefix", label: "Prefix", type: "text", maxLength: 20 },
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
