import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSimpleMasterApi } from "./api";

export function createSimpleMasterHooks<TResponse, TSave>(resource: string) {
  const api = createSimpleMasterApi<TResponse, TSave>(resource);

  function useList() {
    return useQuery({
      queryKey: [resource, "list"],
      queryFn: () => api.list(),
      staleTime: 30_000,
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

  return { api, useList, useCreate, useUpdate };
}
