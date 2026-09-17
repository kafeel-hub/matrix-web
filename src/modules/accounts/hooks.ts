import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import * as accountsApi from "./api";

export function usePettyCashAccounts() {
  return useQuery({
    queryKey: ["accounts", "petty-cash"],
    queryFn: () => accountsApi.getPettyCashAccounts(),
    staleTime: 60_000,
  });
}

export function useAccountSearch(term: string) {
  const debounced = useDebouncedValue(term, 250);
  return useQuery({
    queryKey: ["accounts", "search", debounced],
    queryFn: () => accountsApi.searchAccounts({ search: debounced, pageSize: 10 }),
    enabled: debounced.trim().length >= 2,
    staleTime: 30_000,
  });
}

export function useAccount(accountNo: string | undefined) {
  return useQuery({
    queryKey: ["accounts", "detail", accountNo],
    queryFn: () => accountsApi.getAccount(accountNo!),
    enabled: Boolean(accountNo),
  });
}
