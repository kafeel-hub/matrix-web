import { apiClient } from "@/api/client";
import type { AccountVoucherRequest, AccountVoucherSaveResponse } from "@/types/accountVouchers";

const acceptSaveOutcome = { validateStatus: (status: number) => status === 200 || status === 400 };

/** basePath: "/receipt-vouchers" or "/payment-vouchers". */
export function createVoucherApi(basePath: string) {
  async function save(request: AccountVoucherRequest): Promise<AccountVoucherSaveResponse> {
    const { data } = await apiClient.post<AccountVoucherSaveResponse>(basePath, request, acceptSaveOutcome);
    return data;
  }

  async function post(voucherNo: number): Promise<AccountVoucherSaveResponse> {
    const { data } = await apiClient.post<AccountVoucherSaveResponse>(
      `${basePath}/${voucherNo}/post`,
      undefined,
      acceptSaveOutcome,
    );
    return data;
  }

  return { save, post };
}
