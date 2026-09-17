import { apiClient } from "@/api/client";
import type { SalesInvoiceRequest, SalesInvoiceSaveResponse } from "@/types/sales";

// SalesInvoiceController returns the same SalesInvoiceSaveResponse body on
// both 200 (saved/posted) and 400 (validation failed) — the shape carries
// `saved`/`posted` and `errors` either way. `validateStatus` here stops
// axios from throwing on the 400 case so callers can just check
// `result.saved` / `result.posted` instead of try/catching a business
// outcome that isn't really an exceptional error.
const acceptSaveOutcome = { validateStatus: (status: number) => status === 200 || status === 400 };

/** POST /api/sales-invoices — saves (but does not yet post) the invoice. */
export async function saveSalesInvoice(
  request: SalesInvoiceRequest,
): Promise<SalesInvoiceSaveResponse> {
  const { data } = await apiClient.post<SalesInvoiceSaveResponse>(
    "/sales-invoices",
    request,
    acceptSaveOutcome,
  );
  return data;
}

/** POST /api/sales-invoices/{transactionNo}/post — posts a previously saved invoice. */
export async function postSalesInvoice(transactionNo: number): Promise<SalesInvoiceSaveResponse> {
  const { data } = await apiClient.post<SalesInvoiceSaveResponse>(
    `/sales-invoices/${transactionNo}/post`,
    undefined,
    acceptSaveOutcome,
  );
  return data;
}
