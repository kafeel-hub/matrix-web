import { apiClient } from "@/api/client";
import type { ScrapPurchaseRequest, ScrapPurchaseSaveResponse } from "@/types/scrapPurchases";

// Same reasoning as invoice-api.ts: ScrapPurchaseController returns the
// same body shape on 200 and 400, so validateStatus avoids an unnecessary
// throw for the ordinary "validation failed" outcome.
const acceptSaveOutcome = { validateStatus: (status: number) => status === 200 || status === 400 };

export async function saveScrapPurchase(
  request: ScrapPurchaseRequest,
): Promise<ScrapPurchaseSaveResponse> {
  const { data } = await apiClient.post<ScrapPurchaseSaveResponse>(
    "/scrap-purchases",
    request,
    acceptSaveOutcome,
  );
  return data;
}

export async function postScrapPurchase(transactionNo: number): Promise<ScrapPurchaseSaveResponse> {
  const { data } = await apiClient.post<ScrapPurchaseSaveResponse>(
    `/scrap-purchases/${transactionNo}/post`,
    undefined,
    acceptSaveOutcome,
  );
  return data;
}
