import { apiClient } from "@/api/client";
import type { GoldFixingVoucherRequest, GoldFixingVoucherSaveResponse } from "@/types/goldFixingVouchers";

const acceptSaveOutcome = { validateStatus: (status: number) => status === 200 || status === 400 };

/** basePath: "/sales-gold-fixing-vouchers" or "/purchase-gold-fixing-vouchers". */
export function createGoldFixingVoucherApi(basePath: string) {
  async function save(request: GoldFixingVoucherRequest): Promise<GoldFixingVoucherSaveResponse> {
    const { data } = await apiClient.post<GoldFixingVoucherSaveResponse>(
      basePath,
      request,
      acceptSaveOutcome,
    );
    return data;
  }

  async function post(voucherNo: number): Promise<GoldFixingVoucherSaveResponse> {
    const { data } = await apiClient.post<GoldFixingVoucherSaveResponse>(
      `${basePath}/${voucherNo}/post`,
      undefined,
      acceptSaveOutcome,
    );
    return data;
  }

  return { save, post };
}
