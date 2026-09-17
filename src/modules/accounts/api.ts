import { apiClient } from "@/api/client";
import type { AccountDetailResponse, AccountLookupResponse, AccountSearchResponse } from "@/types/accounts";

export async function getPettyCashAccounts(): Promise<AccountLookupResponse[]> {
  const { data } = await apiClient.get<AccountLookupResponse[]>("/accounts/petty-cash");
  return data;
}

export async function searchAccounts(params: {
  search?: string;
  excludeAccountNo?: string;
  page?: number;
  pageSize?: number;
}): Promise<AccountSearchResponse> {
  const { data } = await apiClient.get<AccountSearchResponse>("/accounts/search", { params });
  return data;
}

export async function getAccount(accountNo: string): Promise<AccountDetailResponse | null> {
  try {
    const { data } = await apiClient.get<AccountDetailResponse>(
      `/accounts/${encodeURIComponent(accountNo)}`,
    );
    return data;
  } catch (error) {
    if (statusOf(error) === 404) return null;
    throw error;
  }
}

function statusOf(error: unknown): number | undefined {
  return typeof error === "object" && error !== null && "response" in error
    ? (error as { response?: { status?: number } }).response?.status
    : undefined;
}
