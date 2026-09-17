import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createItemMasterApi } from "./api";

/**
 * `filterParam` (e.g. "itemTypeId" for categories, "categoryId" for
 * subcategories) makes useList take an optional parent id and pass it
 * through as that query param — the cascading-dropdown filter the API
 * supports (GET /item-categories?itemTypeId=..., etc).
 */
export function createItemMasterHooks<TResponse, TSave>(resource: string, filterParam?: string) {
  const api = createItemMasterApi<TResponse, TSave>(resource);

  function useList(parentId?: string) {
    return useQuery({
      queryKey: [resource, "list", parentId ?? null],
      queryFn: () => api.list(filterParam && parentId ? { [filterParam]: parentId } : undefined),
      staleTime: 15_000,
    });
  }

  function useDetail(id: string | undefined) {
    return useQuery({
      queryKey: [resource, "detail", id],
      queryFn: () => api.get(id!),
      enabled: Boolean(id),
    });
  }

  function useCreate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (request: TSave) => api.create(request),
      onSuccess: (outcome) => {
        if (outcome.ok) queryClient.invalidateQueries({ queryKey: [resource, "list"] });
      },
    });
  }

  function useUpdate(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (request: TSave) => api.update(id, request),
      onSuccess: (outcome) => {
        if (outcome.ok) queryClient.invalidateQueries({ queryKey: [resource, "list"] });
      },
    });
  }

  function useDeactivate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => api.deactivate(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [resource, "list"] }),
    });
  }

  return { api, useList, useDetail, useCreate, useUpdate, useDeactivate };
}
