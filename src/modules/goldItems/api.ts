import { apiClient } from "@/api/client";
import type {
  GoldItemListResponse,
  GoldItemResponse,
  GoldItemSaveResponse,
  NextGoldItemCodeResponse,
  SaveGoldItemRequest,
} from "@/types/goldItems";

export type GoldItemOutcome =
  | { ok: true; result: GoldItemSaveResponse }
  | { ok: false; kind: "validation"; message: string }
  | { ok: false; kind: "not-found" };

// GoldItemsController catches ArgumentException into a flat {code,message}
// on 400 (same shape as item-masters' business-rule errors) — no
// DataAnnotations-dictionary path here since the service validates
// references (item type, category, purity, etc.) itself before the SP call.
const acceptSaveOutcome = { validateStatus: (status: number) => [200, 201, 400, 404].includes(status) };

export async function searchGoldItems(params: {
  search?: string;
  itemTypeId?: string;
  categoryId?: string;
  subcategoryId?: string;
  page?: number;
  pageSize?: number;
}): Promise<GoldItemListResponse[]> {
  const { data } = await apiClient.get<GoldItemListResponse[]>("/items", { params });
  return data;
}

export async function getGoldItem(itemId: string): Promise<GoldItemResponse | null> {
  try {
    const { data } = await apiClient.get<GoldItemResponse>(`/items/${encodeURIComponent(itemId)}`);
    return data;
  } catch (error) {
    if (statusOf(error) === 404) return null;
    throw error;
  }
}

export async function getNextGoldItemCode(params: {
  itemTypeId: string;
  categoryId: string;
  subcategoryId?: string;
}): Promise<NextGoldItemCodeResponse | null> {
  const response = await apiClient.get<NextGoldItemCodeResponse | { code: string; message: string }>(
    "/items/next-code",
    { params, validateStatus: (s) => s === 200 || s === 400 },
  );
  if (response.status !== 200) return null;
  return response.data as NextGoldItemCodeResponse;
}

export async function createGoldItem(request: SaveGoldItemRequest): Promise<GoldItemOutcome> {
  const response = await apiClient.post("/items", request, acceptSaveOutcome);
  return toOutcome(response);
}

export async function updateGoldItem(itemId: string, request: SaveGoldItemRequest): Promise<GoldItemOutcome> {
  const response = await apiClient.put(`/items/${encodeURIComponent(itemId)}`, request, acceptSaveOutcome);
  return toOutcome(response);
}

export async function deactivateGoldItem(itemId: string): Promise<boolean> {
  const { status } = await apiClient.delete(`/items/${encodeURIComponent(itemId)}`, {
    validateStatus: (s) => s === 204 || s === 404,
  });
  return status === 204;
}

function toOutcome(response: { status: number; data: unknown }): GoldItemOutcome {
  if (response.status === 200 || response.status === 201) {
    return { ok: true, result: response.data as GoldItemSaveResponse };
  }
  if (response.status === 400) {
    return { ok: false, kind: "validation", message: (response.data as { message: string }).message };
  }
  return { ok: false, kind: "not-found" };
}

function statusOf(error: unknown): number | undefined {
  return typeof error === "object" && error !== null && "response" in error
    ? (error as { response?: { status?: number } }).response?.status
    : undefined;
}
