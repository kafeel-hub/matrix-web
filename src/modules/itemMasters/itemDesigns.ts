import { createItemMasterHooks } from "./hooks";
import type { ItemMasterFieldDescriptor } from "./ItemMasterMaintenanceView";
import type { ItemDesignResponse, SaveItemDesignRequest } from "@/types/itemMasters";

export const itemDesignHooks = createItemMasterHooks<ItemDesignResponse, SaveItemDesignRequest>(
  "item-designs",
);

export const emptyItemDesign: SaveItemDesignRequest = {
  designId: "",
  name: "",
  nameArabic: "",
  prefix: "",
  status: 0,
};

export function itemDesignToSaveRequest(r: ItemDesignResponse): SaveItemDesignRequest {
  return {
    designId: r.designId,
    name: r.name,
    nameArabic: r.nameArabic ?? "",
    prefix: r.prefix ?? "",
    status: r.status,
  };
}

export const itemDesignFields: ItemMasterFieldDescriptor<SaveItemDesignRequest>[] = [
  { key: "designId", label: "Code", type: "text", maxLength: 3, disabledOnEdit: true },
  { key: "name", label: "Name", type: "text", maxLength: 100 },
  { key: "nameArabic", label: "Name (Arabic)", type: "text", maxLength: 100 },
  { key: "prefix", label: "Prefix", type: "text", maxLength: 5 },
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
