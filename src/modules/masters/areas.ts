import { createSimpleMasterHooks } from "./hooks";
import type { MasterFieldDescriptor } from "./MasterMaintenanceView";
import type { AreaResponse, SaveAreaRequest } from "@/types/masters";

export const areaHooks = createSimpleMasterHooks<AreaResponse, SaveAreaRequest>("areas");

export const emptyArea: SaveAreaRequest = {
  areaId: "",
  name: "",
  nameArabic: "",
  prefix: "",
  countryId: "",
};

export function areaToSaveRequest(r: AreaResponse): SaveAreaRequest {
  return {
    areaId: r.areaId,
    name: r.name ?? "",
    nameArabic: r.nameArabic ?? "",
    prefix: r.prefix ?? "",
    countryId: r.countryId ?? "",
  };
}

export const areaFields: MasterFieldDescriptor<SaveAreaRequest>[] = [
  { key: "areaId", label: "Code", type: "text", maxLength: 3, disabledOnEdit: true },
  { key: "name", label: "Name", type: "text", maxLength: 50 },
  { key: "nameArabic", label: "Name (Arabic)", type: "text", maxLength: 50 },
  { key: "prefix", label: "Prefix", type: "text", maxLength: 5 },
  // Plain text rather than a country dropdown to keep this module
  // self-contained — cross-wiring the countries list here is a reasonable
  // future enhancement (see the CountryPicker note in the README).
  { key: "countryId", label: "Country code", type: "text", maxLength: 3 },
];
