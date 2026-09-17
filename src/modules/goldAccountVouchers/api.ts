import { apiClient } from "@/api/client";
import type { GoldAccountVoucherRequest, GoldAccountVoucherSaveResponse } from "@/types/goldAccountVouchers";

const acceptSaveOutcome = { validateStatus: (status: number) => status === 200 || status === 400 };

/** basePath: "/gold-receipt-vouchers" or "/gold-payment-vouchers". */
export function createGoldVoucherApi(basePath: string) {
  async function save(request: GoldAccountVoucherRequest): Promise<GoldAccountVoucherSaveResponse> {
    const { data } = await apiClient.post<GoldAccountVoucherSaveResponse>(
      basePath,
      request,
      acceptSaveOutcome,
    );
    return data;
  }

  async function post(voucherNo: number): Promise<GoldAccountVoucherSaveResponse> {
    const { data } = await apiClient.post<GoldAccountVoucherSaveResponse>(
      `${basePath}/${voucherNo}/post`,
      undefined,
      acceptSaveOutcome,
    );
    return data;
  }

  return { save, post };
}
