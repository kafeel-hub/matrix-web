import { apiClient } from "./client";
import type {
  LoginResponse,
  LogoutResponse,
  MeResponse,
  RefreshResponse,
} from "@/types/auth";

export type LoginOutcome =
  | { kind: "response"; response: LoginResponse }
  | { kind: "tenant-error"; message: string };

export async function login(userName: string, password: string): Promise<LoginOutcome> {
  // AuthController.Login always returns 200 — even invalid credentials come
  // back as {succeeded:false} in the body, never a non-2xx status. So any
  // non-200 here can only be TenantResolutionMiddleware rejecting the
  // request before it ever reached auth logic. As of the v20 central tenant
  // catalog, that's four distinct cases, not two — confirmed by reading
  // TenantResolutionMiddleware.cs directly:
  //   400 — header missing entirely (route guards should prevent this)
  //   404 — "Tenant was not found." (unknown org code)
  //   403 — "Tenant is disabled." (known org, disabled — new in v20)
  //   503 — "Tenant catalog is unavailable..." (catalog DB unreachable — new in v20)
  // All four share the same {error: string} body shape, so one branch
  // handles them uniformly rather than trying to give each its own copy.
  const response = await apiClient.post<LoginResponse | { error: string }>(
    "/auth/login",
    { userName, password },
    { validateStatus: (status) => status === 200 || status === 400 || status === 403 || status === 404 || status === 503 },
  );
  if (response.status === 200) {
    return { kind: "response", response: response.data as LoginResponse };
  }
  return { kind: "tenant-error", message: (response.data as { error: string }).error };
}

export async function selectContext(
  preAuthToken: string,
  companyId: number,
  locationId: number,
) {
  const { data } = await apiClient.post<LoginResponse>("/auth/select-context", {
    preAuthToken,
    companyId,
    locationId,
  });
  return data;
}

export async function refresh(refreshToken: string) {
  const { data } = await apiClient.post<RefreshResponse>("/auth/refresh", {
    refreshToken,
  });
  return data;
}

export async function logout(refreshToken: string) {
  const { data } = await apiClient.post<LogoutResponse>("/auth/logout", {
    refreshToken,
  });
  return data;
}

export async function logoutAll() {
  const { data } = await apiClient.post<LogoutResponse>("/auth/logout-all");
  return data;
}

export async function me() {
  const { data } = await apiClient.get<MeResponse>("/auth/me");
  return data;
}
