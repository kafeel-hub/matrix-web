import { createItemMasterHooks } from "./hooks";
import type { ItemMasterFieldDescriptor } from "./ItemMasterMaintenanceView";
import type { ItemTypeResponse, SaveItemTypeRequest } from "@/types/itemMasters";

export const itemTypeHooks = createItemMasterHooks<ItemTypeResponse, SaveItemTypeRequest>("item-types");

export const emptyItemType: SaveItemTypeRequest = {
  itemTypeId: "",
  name: "",
  nameArabic: "",
  prefix: "",
  purchaseAccountNo: "",
  salesAccountNo: "",
  salesCostAccountNo: "",
  stockAccountNo: "",
  stockFlag: 0,
  isDefault: 0,
  purePurity: 0,
  nature: 0,
  status: 0,
};

export function itemTypeToSaveRequest(r: ItemTypeResponse): SaveItemTypeRequest {
  return {
    itemTypeId: r.itemTypeId,
    name: r.name,
    nameArabic: r.nameArabic ?? "",
    prefix: r.prefix ?? "",
    purchaseAccountNo: r.purchaseAccountNo ?? "",
    salesAccountNo: r.salesAccountNo ?? "",
    salesCostAccountNo: r.salesCostAccountNo ?? "",
    stockAccountNo: r.stockAccountNo ?? "",
    stockFlag: r.stockFlag,
    isDefault: r.isDefault,
    purePurity: r.purePurity,
    nature: r.nature,
    status: r.status,
  };
}

// `stockFlag` and `nature` are legacy byte codes with no code list available
// from the API — same situation as transactionTypeId elsewhere — left as
// plain numbers rather than guessed dropdown labels.
export const itemTypeFields: ItemMasterFieldDescriptor<SaveItemTypeRequest>[] = [
  { key: "itemTypeId", label: "Code", type: "text", maxLength: 2, disabledOnEdit: true },
  { key: "name", label: "Name", type: "text", maxLength: 50 },
  { key: "nameArabic", label: "Name (Arabic)", type: "text", maxLength: 50 },
  { key: "prefix", label: "Prefix", type: "text", maxLength: 1 },
  { key: "purchaseAccountNo", label: "Purchase account", type: "account" },
  { key: "salesAccountNo", label: "Sales account", type: "account" },
  { key: "salesCostAccountNo", label: "Sales cost account", type: "account" },
  { key: "stockAccountNo", label: "Stock account", type: "account" },
  { key: "stockFlag", label: "Stock flag (code)", type: "number" },
  { key: "nature", label: "Nature (code)", type: "number" },
  { key: "purePurity", label: "Pure purity", type: "number", step: 0.01 },
  { key: "isDefault", label: "Default item type", type: "checkbox", numericBoolean: true },
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
