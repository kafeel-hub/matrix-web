import { apiClient } from "@/api/client";
import type { MasterSaveResponse } from "@/types/masters";

export type SimpleMasterOutcome =
  | { ok: true; result: MasterSaveResponse }
  | { ok: false; kind: "validation"; messages: string[] }
  | { ok: false; kind: "not-found" };

// Unlike the party (customer/supplier) endpoints, these four controllers
// have no custom validation exception — invalid requests fail ASP.NET
// Core's built-in [ApiController] model validation and come back as the
// framework's default ValidationProblemDetails shape:
//   { errors: { FieldName: ["message", ...], ... }, title, status, ... }
// which is a field→messages *dictionary*, not the { errors: [{code,message}] }
// *array* the party endpoints use. Update additionally has its own
// hand-written 400 for a route/payload id mismatch: { code, message }. This
// normalizes all three shapes into one flat string[] so the UI doesn't need
// to know which one it got.
const acceptSaveOutcome = { validateStatus: (status: number) => [200, 201, 400, 404].includes(status) };

export function createSimpleMasterApi<TResponse, TSave>(resource: string) {
  const basePath = `/${resource}`;

  async function list(): Promise<TResponse[]> {
    const { data } = await apiClient.get<TResponse[]>(basePath);
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

  async function create(request: TSave): Promise<SimpleMasterOutcome> {
    const response = await apiClient.post(basePath, request, acceptSaveOutcome);
    return toOutcome(response);
  }

  async function update(id: string, request: TSave): Promise<SimpleMasterOutcome> {
    const response = await apiClient.put(`${basePath}/${encodeURIComponent(id)}`, request, acceptSaveOutcome);
    return toOutcome(response);
  }

  return { list, get, create, update };
}

function toOutcome(response: { status: number; data: unknown }): SimpleMasterOutcome {
  if (response.status === 200 || response.status === 201) {
    return { ok: true, result: response.data as MasterSaveResponse };
  }
  if (response.status === 400) {
    return { ok: false, kind: "validation", messages: extractErrorMessages(response.data) };
  }
  return { ok: false, kind: "not-found" };
}

// Exported because item-masters (modules/itemMasters/api.ts) hits the exact
// same two 400 shapes — ASP.NET's default ValidationProblemDetails for
// DataAnnotation failures, and a hand-written flat {code,message} for
// business-rule ArgumentExceptions — so it reuses this rather than
// re-implementing the same normalization.
export function extractErrorMessages(data: unknown): string[] {
  if (data && typeof data === "object") {
    if ("errors" in data) {
      const errors = (data as { errors: unknown }).errors;
      if (errors && typeof errors === "object" && !Array.isArray(errors)) {
        // ValidationProblemDetails: { errors: { field: string[] } }
        return Object.values(errors as Record<string, string[]>).flat();
      }
    }
    if ("message" in data && typeof (data as { message: unknown }).message === "string") {
      // The hand-written ID_MISMATCH shape: { code, message }
      return [(data as { message: string }).message];
    }
  }
  return ["The request was invalid."];
}

function statusOf(error: unknown): number | undefined {
  return typeof error === "object" && error !== null && "response" in error
    ? (error as { response?: { status?: number } }).response?.status
    : undefined;
}
