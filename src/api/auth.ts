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
  // back as {succeeded:false} in the body, never a non-2xx status. So a
  // 400/404 here can only be TenantResolutionMiddleware rejecting the
  // request before it ever reached auth logic (missing/unknown tenant key),
  // which responds with a differently-shaped {error: string} body. The
  // route guards should prevent a missing header in normal
  // use; a wrong org code is the realistic case this actually catches.
  const response = await apiClient.post<LoginResponse | { error: string }>(
    "/auth/login",
    { userName, password },
    { validateStatus: (status) => status === 200 || status === 400 || status === 404 },
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
