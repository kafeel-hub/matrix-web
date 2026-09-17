import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import * as salesApi from "./api";

/** Search-as-you-type item suggestions. Off until 2+ characters are typed. */
export function useItemSearch(term: string) {
  const debounced = useDebouncedValue(term, 250);
  return useQuery({
    queryKey: ["items", "search", debounced],
    queryFn: () => salesApi.searchItems(debounced),
    enabled: debounced.trim().length >= 2,
    staleTime: 60_000,
  });
}

/** Search-as-you-type master customer suggestions. */
export function useCustomerSearch(term: string) {
  const debounced = useDebouncedValue(term, 250);
  return useQuery({
    queryKey: ["customers", "search", debounced],
    queryFn: () => salesApi.searchCustomers(debounced),
    enabled: debounced.trim().length >= 2,
    staleTime: 30_000,
  });
}
