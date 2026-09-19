import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "./api";
import { getDashboardAnalytics } from "./analyticsApi";

export function useDashboard(dateFrom: string, dateTo: string, enabled = true) {
  return useQuery({
    queryKey: ["dashboard", dateFrom, dateTo],
    queryFn: () => getDashboard(dateFrom, dateTo),
    staleTime: 30_000,
    enabled,
  });
}

export function useDashboardAnalytics(dateFrom: string, dateTo: string, enabled = true) {
  return useQuery({
    queryKey: ["dashboard-analytics", dateFrom, dateTo],
    queryFn: () => getDashboardAnalytics(dateFrom, dateTo),
    staleTime: 30_000,
    enabled,
  });
}
