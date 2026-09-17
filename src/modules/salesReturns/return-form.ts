import type { SalesReturnHeaderRequest } from "@/types/salesReturns";
import { createEmptyHeader } from "@/modules/sales/invoice-form";

/**
 * SalesReturnHeaderRequest is SalesInvoiceHeaderRequest plus three
 * "original invoice" reference fields, so this builds on the sales
 * module's header factory rather than re-declaring every field.
 */
export function createEmptyReturnHeader(defaults: {
  currencyId: string;
  salesmanId: string;
}): SalesReturnHeaderRequest {
  return {
    ...createEmptyHeader(defaults),
    originalInvoiceYear: 0,
    originalInvoiceNo: "",
    originalInvoiceDate: null,
  };
}

// Line items and payments are field-for-field identical to sales invoice
// (see types/salesReturns.ts), so the reducers, totals math, and the
// scan-to-line mapper are reused directly rather than duplicated:
export {
  lineItemsReducer,
  paymentsReducer,
  lineItemFromScan,
  emptyPayment,
  calculateTotals,
  type LineItemDraft,
  type PaymentDraft,
  type InvoiceTotals,
} from "@/modules/sales/invoice-form";
