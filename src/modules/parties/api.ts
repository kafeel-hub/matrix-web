import { apiClient } from "@/api/client";
import type {
  PartyDetailResponse,
  PartySaveResponse,
  PartySummaryResponse,
  SavePartyRequest,
} from "@/types/catalog";
import type { ValidationError } from "@/types/common";

export type SaveOutcome =
  | { ok: true; result: PartySaveResponse }
  | { ok: false; kind: "validation"; errors: ValidationError[] }
  | { ok: false; kind: "conflict"; message: string }
  | { ok: false; kind: "not-found" };

// Create (201) and update (200) both succeed; a 400 carries `{ errors }`
// from PartyValidationException, a 409 carries `{ code, message }` for
// setup problems like "no active financial year" — both are ordinary,
// expected outcomes here, not transport failures, so they're handled via
// validateStatus rather than a try/catch around a thrown AxiosError.
const acceptSaveOutcome = {
  validateStatus: (status: number) => [200, 201, 400, 404, 409].includes(status),
};

/**
 * `CustomerController` and `SupplierController` are structurally identical
 * — both are thin wrappers over `PartyService`/`PartyValidator`, differing
 * only in their base route and the `Prt_Type` constant baked in server-side.
 * This factory captures that shared shape once instead of duplicating it
 * per module. `resource` is the API path segment: "customers" or
 * "suppliers".
 */
export function createPartyApi(resource: "customers" | "suppliers") {
  const basePath = `/${resource}`;

  async function list(term: string, take = 50): Promise<PartySummaryResponse[]> {
    const { data } = await apiClient.get<PartySummaryResponse[]>(basePath, {
      params: { term: term || undefined, take },
    });
    return data;
  }

  async function get(partyId: string): Promise<PartyDetailResponse | null> {
    try {
      const { data } = await apiClient.get<PartyDetailResponse>(
        `${basePath}/${encodeURIComponent(partyId)}`,
      );
      return data;
    } catch (error) {
      if (statusOf(error) === 404) return null;
      throw error;
    }
  }

  async function create(request: SavePartyRequest): Promise<SaveOutcome> {
    const response = await apiClient.post(basePath, request, acceptSaveOutcome);
    return toOutcome(response);
  }

  async function update(partyId: string, request: SavePartyRequest): Promise<SaveOutcome> {
    const response = await apiClient.put(
      `${basePath}/${encodeURIComponent(partyId)}`,
      request,
      acceptSaveOutcome,
    );
    return toOutcome(response);
  }

  async function deactivate(partyId: string): Promise<boolean> {
    const { status } = await apiClient.delete(`${basePath}/${encodeURIComponent(partyId)}`, {
      validateStatus: (s) => s === 200 || s === 404,
    });
    return status === 200;
  }

  return { list, get, create, update, deactivate };
}

function toOutcome(response: { status: number; data: unknown }): SaveOutcome {
  if (response.status === 200 || response.status === 201) {
    return { ok: true, result: response.data as PartySaveResponse };
  }
  if (response.status === 400) {
    return { ok: false, kind: "validation", errors: (response.data as { errors: ValidationError[] }).errors };
  }
  if (response.status === 409) {
    return { ok: false, kind: "conflict", message: (response.data as { message: string }).message };
  }
  return { ok: false, kind: "not-found" };
}

function statusOf(error: unknown): number | undefined {
  return typeof error === "object" && error !== null && "response" in error
    ? (error as { response?: { status?: number } }).response?.status
    : undefined;
}
