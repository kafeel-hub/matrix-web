import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import * as goldItemsApi from "./api";

export function useGoldItemSearch(params: {
  search: string;
  itemTypeId?: string;
  categoryId?: string;
  subcategoryId?: string;
}) {
  const debouncedSearch = useDebouncedValue(params.search, 300);
  return useQuery({
    queryKey: ["gold-items", "search", debouncedSearch, params.itemTypeId, params.categoryId, params.subcategoryId],
    queryFn: () =>
      goldItemsApi.searchGoldItems({
        search: debouncedSearch || undefined,
        itemTypeId: params.itemTypeId || undefined,
        categoryId: params.categoryId || undefined,
        subcategoryId: params.subcategoryId || undefined,
        pageSize: 50,
      }),
    staleTime: 15_000,
  });
}

export function useGoldItem(itemId: string | undefined) {
  return useQuery({
    queryKey: ["gold-items", "detail", itemId],
    queryFn: () => goldItemsApi.getGoldItem(itemId!),
    enabled: Boolean(itemId),
  });
}

export function useCreateGoldItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: Parameters<typeof goldItemsApi.createGoldItem>[0]) =>
      goldItemsApi.createGoldItem(request),
    onSuccess: (outcome) => {
      if (outcome.ok) queryClient.invalidateQueries({ queryKey: ["gold-items", "search"] });
    },
  });
}

export function useUpdateGoldItem(itemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: Parameters<typeof goldItemsApi.updateGoldItem>[1]) =>
      goldItemsApi.updateGoldItem(itemId, request),
    onSuccess: (outcome) => {
      if (outcome.ok) {
        queryClient.invalidateQueries({ queryKey: ["gold-items", "search"] });
        queryClient.invalidateQueries({ queryKey: ["gold-items", "detail", itemId] });
      }
    },
  });
}

export function useDeactivateGoldItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => goldItemsApi.deactivateGoldItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gold-items", "search"] }),
  });
}
