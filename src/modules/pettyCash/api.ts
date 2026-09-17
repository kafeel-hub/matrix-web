import { apiClient } from "@/api/client";
import type { PettyCashExpenseRequest, PettyCashExpenseSaveResponse } from "@/types/pettyCash";

const acceptSaveOutcome = { validateStatus: (status: number) => status === 200 || status === 400 };

export async function savePettyCashExpense(
  request: PettyCashExpenseRequest,
): Promise<PettyCashExpenseSaveResponse> {
  const { data } = await apiClient.post<PettyCashExpenseSaveResponse>(
    "/petty-cash-expenses",
    request,
    acceptSaveOutcome,
  );
  return data;
}

export async function postPettyCashExpense(voucherNo: number): Promise<PettyCashExpenseSaveResponse> {
  const { data } = await apiClient.post<PettyCashExpenseSaveResponse>(
    `/petty-cash-expenses/${voucherNo}/post`,
    undefined,
    acceptSaveOutcome,
  );
  return data;
}
