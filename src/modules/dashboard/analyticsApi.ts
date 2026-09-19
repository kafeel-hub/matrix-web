import { apiClient } from "@/api/client";
import type { DashboardAnalyticsResponse } from "@/types/dashboardAnalytics";

export type DashboardAnalyticsOutcome =
  | { ok: true; data: DashboardAnalyticsResponse }
  | { ok: false; message: string };

/**
 * dateFrom/dateTo are "yyyy-MM-dd" strings, same as getDashboard in
 * ./api.ts. groupBy ("day"|"month") is left undefined here — nothing in
 * this build renders the trend/BalanceTrend series yet, so there's no UI
 * control for it; the server defaults to "day" when omitted.
 */
export async function getDashboardAnalytics(
  dateFrom?: string,
  dateTo?: string,
): Promise<DashboardAnalyticsOutcome> {
  const response = await apiClient.get<DashboardAnalyticsResponse | { code: string; message: string }>(
    "/dashboard/analytics",
    {
      params: { dateFrom, dateTo },
      validateStatus: (status) => status === 200 || status === 400,
    },
  );
  if (response.status === 200) {
    return { ok: true, data: response.data as DashboardAnalyticsResponse };
  }
  return { ok: false, message: (response.data as { message: string }).message };
}
