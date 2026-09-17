import { apiClient } from "@/api/client";
import type { MasterSaveResponse } from "@/types/masters";
import { extractErrorMessages } from "@/modules/masters/api";

export type ItemMasterOutcome =
  | { ok: true; result: MasterSaveResponse }
  | { ok: false; kind: "validation"; messages: string[] }
  | { ok: false; kind: "not-found" };

const acceptSaveOutcome = { validateStatus: (status: number) => [200, 201, 400, 404].includes(status) };

/**
 * Unlike the original five masters (modules/masters), these five DO expose
 * a delete endpoint (soft-deactivate, status=1 — see docs/item-supporting-masters-v13.md)
 * and validation errors can come back in either of two shapes: ASP.NET's
 * default ValidationProblemDetails dictionary for DataAnnotation failures,
 * or a hand-written flat {code,message} for business-rule ArgumentExceptions
 * caught in the controller. `extractErrorMessages` (shared with
 * modules/masters/api.ts) normalizes both.
 *
 * Ids are treated as plain strings throughout — including gold purity's
 * numeric PurityNo, which only needs to be a real `number` in the request
 * *body* (see SaveGoldPurityRequest), not in the URL path, where it's just
 * string interpolation either way.
 */
export function createItemMasterApi<TResponse, TSave>(resource: string) {
  const basePath = `/${resource}`;

  async function list(params?: Record<string, string>): Promise<TResponse[]> {
    const { data } = await apiClient.get<TResponse[]>(basePath, { params });
    return data;
  }

  async function get(id: string): Promise<TResponse | null> {
    try {
      const { data } = await apiClient.get<TResponse>(`${basePath}/${encodeURIComponent(id)}`);
      return data;
    } catch (error) {
      if (statusOf(error) === 404) return null;
      throw error;
    }
  }

  async function create(request: TSave): Promise<ItemMasterOutcome> {
    const response = await apiClient.post(basePath, request, acceptSaveOutcome);
    return toOutcome(response);
  }

  async function update(id: string, request: TSave): Promise<ItemMasterOutcome> {
    const response = await apiClient.put(`${basePath}/${encodeURIComponent(id)}`, request, acceptSaveOutcome);
    return toOutcome(response);
  }

  async function deactivate(id: string): Promise<boolean> {
    const { status } = await apiClient.delete(`${basePath}/${encodeURIComponent(id)}`, {
      validateStatus: (s) => s === 204 || s === 404,
    });
    return status === 204;
  }

  return { list, get, create, update, deactivate };
}

function toOutcome(response: { status: number; data: unknown }): ItemMasterOutcome {
  if (response.status === 200 || response.status === 201) {
    return { ok: true, result: response.data as MasterSaveResponse };
  }
  if (response.status === 400) {
    return { ok: false, kind: "validation", messages: extractErrorMessages(response.data) };
  }
  return { ok: false, kind: "not-found" };
}

function statusOf(error: unknown): number | undefined {
  return typeof error === "object" && error !== null && "response" in error
    ? (error as { response?: { status?: number } }).response?.status
    : undefined;
}
