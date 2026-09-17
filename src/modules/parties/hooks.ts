import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { createPartyApi } from "./api";
import type { SavePartyRequest } from "@/types/catalog";

export function createPartyHooks(resource: "customers" | "suppliers") {
  const api = createPartyApi(resource);

  function useList(term: string) {
    const debounced = useDebouncedValue(term, 300);
    return useQuery({
      queryKey: [resource, "list", debounced],
      queryFn: () => api.list(debounced),
      staleTime: 15_000,
    });
  }

  function useDetail(partyId: string | undefined) {
    return useQuery({
      queryKey: [resource, "detail", partyId],
      queryFn: () => api.get(partyId!),
      enabled: Boolean(partyId),
    });
  }

  function useCreate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (request: SavePartyRequest) => api.create(request),
      onSuccess: (outcome) => {
        if (outcome.ok) queryClient.invalidateQueries({ queryKey: [resource, "list"] });
      },
    });
  }

  function useUpdate(partyId: string) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (request: SavePartyRequest) => api.update(partyId, request),
      onSuccess: (outcome) => {
        if (outcome.ok) {
          queryClient.invalidateQueries({ queryKey: [resource, "list"] });
          queryClient.invalidateQueries({ queryKey: [resource, "detail", partyId] });
        }
      },
    });
  }

  function useDeactivate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (partyId: string) => api.deactivate(partyId),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: [resource, "list"] }),
    });
  }

  return { api, useList, useDetail, useCreate, useUpdate, useDeactivate };
}
