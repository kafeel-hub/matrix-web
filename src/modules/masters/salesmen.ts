import { createSimpleMasterHooks } from "./hooks";
import type { MasterFieldDescriptor } from "./MasterMaintenanceView";
import type { SalesmanResponse, SaveSalesmanRequest } from "@/types/masters";

export const salesmanHooks = createSimpleMasterHooks<SalesmanResponse, SaveSalesmanRequest>("salesmen");

export const emptySalesman: SaveSalesmanRequest = {
  salesmanId: "",
  name: "",
  nameArabic: "",
  prefix: "",
  commissionPercent: 0,
  commissionAccountNo: "",
  locationId: null,
  holdStock: false,
  status: 0,
};

export function salesmanToSaveRequest(r: SalesmanResponse): SaveSalesmanRequest {
  return {
    salesmanId: r.salesmanId,
    name: r.name ?? "",
    nameArabic: r.nameArabic ?? "",
    prefix: r.prefix ?? "",
    commissionPercent: r.commissionPercent,
    commissionAccountNo: r.commissionAccountNo ?? "",
    locationId: r.locationId ?? null,
    holdStock: r.holdStock,
    status: r.status,
  };
}

export const salesmanFields: MasterFieldDescriptor<SaveSalesmanRequest>[] = [
  { key: "salesmanId", label: "Code", type: "text", maxLength: 3, disabledOnEdit: true },
  { key: "name", label: "Name", type: "text", maxLength: 50 },
  { key: "nameArabic", label: "Name (Arabic)", type: "text", maxLength: 50 },
  { key: "prefix", label: "Prefix", type: "text", maxLength: 5 },
  { key: "commissionPercent", label: "Commission %", type: "number", step: 0.01 },
  { key: "commissionAccountNo", label: "Commission account no.", type: "text", maxLength: 30 },
  // `locationId` is nullable on the API (presumably null = all locations),
  // but the generic NumberField always shows/sends a number, not null — so
  // this can't represent "unset" once touched, only a specific location id.
  // Leave it untouched to preserve an existing null; a real "no location
  // restriction" option would need a tri-state control instead of NumberField.
  { key: "locationId", label: "Location ID (blank = all)", type: "number" },
  { key: "holdStock", label: "Holds own stock", type: "checkbox" },
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
