import { apiClient } from "@/api/client";
import type { DashboardResponse } from "@/types/dashboard";

export type DashboardOutcome =
  | { ok: true; data: DashboardResponse }
  | { ok: false; message: string };

/**
 * dateFrom/dateTo are "yyyy-MM-dd" strings. Both are optional — the server
 * defaults dateTo to today and dateFrom to dateTo if omitted, so calling
 * with neither gives "today" (see DashboardService.GetAsync). Company,
 * location, and financial year are all server-resolved from the JWT/tenant
 * header — never accepted from the query string.
 */
export async function getDashboard(dateFrom?: string, dateTo?: string): Promise<DashboardOutcome> {
  const response = await apiClient.get<DashboardResponse | { code: string; message: string }>(
    "/dashboard",
    {
      params: { dateFrom, dateTo },
      validateStatus: (status) => status === 200 || status === 400,
    },
  );
  if (response.status === 200) {
    return { ok: true, data: response.data as DashboardResponse };
  }
  return { ok: false, message: (response.data as { message: string }).message };
}
