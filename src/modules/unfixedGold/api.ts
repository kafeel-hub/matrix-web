import { apiClient } from "@/api/client";
import type { UnfixedGoldRequest, UnfixedGoldSaveResponse } from "@/types/unfixedGold";

const acceptSaveOutcome = { validateStatus: (status: number) => status === 200 || status === 400 };

/** basePath: "/unfixed-sales" or "/unfixed-purchases". */
export function createUnfixedGoldApi(basePath: string) {
  async function save(request: UnfixedGoldRequest): Promise<UnfixedGoldSaveResponse> {
    const { data } = await apiClient.post<UnfixedGoldSaveResponse>(basePath, request, acceptSaveOutcome);
    return data;
  }

  async function post(transactionNo: number): Promise<UnfixedGoldSaveResponse> {
    const { data } = await apiClient.post<UnfixedGoldSaveResponse>(
      `${basePath}/${transactionNo}/post`,
      undefined,
      acceptSaveOutcome,
    );
    return data;
  }

  return { save, post };
}
