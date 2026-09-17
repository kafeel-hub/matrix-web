// Mirrors Matrix.Api/Models/SalesReturns/*.cs
//
// SalesReturnItemRequest and SalesReturnPaymentRequest are field-for-field
// identical to SalesInvoiceItemRequest/SalesInvoicePaymentRequest, so they
// are reused directly rather than redeclared — see invoice-form.ts's
// LineItemDraft/PaymentDraft, which this module reuses as-is.
import type { SalesInvoiceHeaderRequest, SalesInvoiceItemRequest, SalesInvoicePaymentRequest } from "./sales";
import type { ValidationError } from "./common";

export type SalesReturnItemRequest = SalesInvoiceItemRequest;
export type SalesReturnPaymentRequest = SalesInvoicePaymentRequest;

export interface SalesReturnHeaderRequest extends SalesInvoiceHeaderRequest {
  originalInvoiceYear: number;
  originalInvoiceNo: string;
  originalInvoiceDate?: string | null;
}

export interface SalesReturnRequest {
  header: SalesReturnHeaderRequest;
  items: SalesReturnItemRequest[];
  payments: SalesReturnPaymentRequest[];
}

export interface SalesReturnSaveResponse {
  transactionNo: number;
  saved: boolean;
  posted: boolean;
  message: string;
  errors?: ValidationError[] | null;
}
