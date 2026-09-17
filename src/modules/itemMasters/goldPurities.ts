import { createItemMasterHooks } from "./hooks";
import type { ItemMasterFieldDescriptor } from "./ItemMasterMaintenanceView";
import type { GoldPurityResponse, SaveGoldPurityRequest } from "@/types/itemMasters";

export const goldPurityHooks = createItemMasterHooks<GoldPurityResponse, SaveGoldPurityRequest>(
  "gold-purities",
);

export const emptyGoldPurity: SaveGoldPurityRequest = {
  purityNo: 0,
  description: "",
  descriptionArabic: "",
  deductionPercent: 0,
  status: 0,
};

export function goldPurityToSaveRequest(r: GoldPurityResponse): SaveGoldPurityRequest {
  return {
    purityNo: r.purityNo,
    description: r.description,
    descriptionArabic: r.descriptionArabic ?? "",
    deductionPercent: r.deductionPercent,
    status: r.status,
  };
}

// purityNo IS the primary key here (e.g. 875, 999) — unlike every other
// master, there's no separate text code, so this field can't be locked on
// edit the usual way (disabledOnEdit relies on a stable id string, and
// String(purityNo) is that id) — it still works the same way, just numeric.
export const goldPurityFields: ItemMasterFieldDescriptor<SaveGoldPurityRequest>[] = [
  { key: "purityNo", label: "Purity no.", type: "number", step: 0.001, disabledOnEdit: true },
  { key: "description", label: "Description", type: "text", maxLength: 25 },
  { key: "descriptionArabic", label: "Description (Arabic)", type: "text", maxLength: 25 },
  { key: "deductionPercent", label: "Deduction %", type: "number", step: 0.01 },
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
