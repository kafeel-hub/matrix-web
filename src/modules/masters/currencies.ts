import { createSimpleMasterHooks } from "./hooks";
import type { MasterFieldDescriptor } from "./MasterMaintenanceView";
import type { CurrencyResponse, SaveCurrencyRequest } from "@/types/masters";

export const currencyHooks = createSimpleMasterHooks<CurrencyResponse, SaveCurrencyRequest>("currencies");

export const emptyCurrency: SaveCurrencyRequest = {
  currencyId: "",
  name: "",
  nameArabic: "",
  prefix: "",
  suffix: "",
  decimalPlaces: 3,
};

export function currencyToSaveRequest(r: CurrencyResponse): SaveCurrencyRequest {
  return {
    currencyId: r.currencyId,
    name: r.name,
    nameArabic: r.nameArabic ?? "",
    prefix: r.prefix ?? "",
    suffix: r.suffix ?? "",
    decimalPlaces: r.decimalPlaces,
    // Note: `shortName` on the response has no counterpart on
    // SaveCurrencyRequest — it's read-only from this API today, so editing
    // an existing currency can't change it. Worth a follow-up with the API
    // owner if that field needs to be settable.
  };
}

export const currencyFields: MasterFieldDescriptor<SaveCurrencyRequest>[] = [
  { key: "currencyId", label: "Code", type: "text", maxLength: 3, disabledOnEdit: true },
  { key: "name", label: "Name", type: "text", maxLength: 50 },
  { key: "nameArabic", label: "Name (Arabic)", type: "text", maxLength: 50 },
  { key: "prefix", label: "Prefix", type: "text", maxLength: 5 },
  { key: "suffix", label: "Suffix", type: "text", maxLength: 5 },
  { key: "decimalPlaces", label: "Decimal places", type: "number", step: 1 },
];
