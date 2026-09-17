import { createSimpleMasterHooks } from "./hooks";
import type { MasterFieldDescriptor } from "./MasterMaintenanceView";
import type { CountryResponse, SaveCountryRequest } from "@/types/masters";

export const countryHooks = createSimpleMasterHooks<CountryResponse, SaveCountryRequest>("countries");

export const emptyCountry: SaveCountryRequest = {
  countryId: "",
  name: "",
  nameArabic: "",
  prefix: "",
  itemOrigin: 0,
};

export function countryToSaveRequest(r: CountryResponse): SaveCountryRequest {
  return {
    countryId: r.countryId,
    name: r.name,
    nameArabic: r.nameArabic ?? "",
    prefix: r.prefix ?? "",
    itemOrigin: r.itemOrigin,
    // Note: `sortOrder` on the response has no counterpart on
    // SaveCountryRequest — read-only from this API today.
  };
}

// `itemOrigin` is a legacy byte code (likely used to flag countries that
// are valid "item origin" values for jewelry, e.g. for hallmarking) with no
// code list available from the API — left as a plain number.
export const countryFields: MasterFieldDescriptor<SaveCountryRequest>[] = [
  { key: "countryId", label: "Code", type: "text", maxLength: 2, disabledOnEdit: true },
  { key: "name", label: "Name", type: "text", maxLength: 50 },
  { key: "nameArabic", label: "Name (Arabic)", type: "text", maxLength: 50 },
  { key: "prefix", label: "Prefix", type: "text", maxLength: 15 },
  { key: "itemOrigin", label: "Item origin (code)", type: "number" },
];
