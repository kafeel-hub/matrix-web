import { apiClient } from "@/api/client";
import type { SalesReturnRequest, SalesReturnSaveResponse } from "@/types/salesReturns";

// Same reasoning as modules/sales/invoice-api.ts: SalesReturnController
// returns the same SalesReturnSaveResponse body on both 200 and 400, so
// validateStatus keeps axios from throwing on the business-validation case.
const acceptSaveOutcome = { validateStatus: (status: number) => status === 200 || status === 400 };

export async function saveSalesReturn(request: SalesReturnRequest): Promise<SalesReturnSaveResponse> {
  const { data } = await apiClient.post<SalesReturnSaveResponse>(
    "/sales-returns",
    request,
    acceptSaveOutcome,
  );
  return data;
}

export async function postSalesReturn(transactionNo: number): Promise<SalesReturnSaveResponse> {
  const { data } = await apiClient.post<SalesReturnSaveResponse>(
    `/sales-returns/${transactionNo}/post`,
    undefined,
    acceptSaveOutcome,
  );
  return data;
}
