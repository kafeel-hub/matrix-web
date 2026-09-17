import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/auth/auth-store";
import { useTenantStore } from "@/tenant/tenant-store";
import type { RefreshResponse } from "@/types/auth";

// In dev, Vite's proxy (vite.config.ts) forwards /api/* to the ASP.NET Core
// API, so a relative base URL avoids CORS entirely. In prod, point
// VITE_API_BASE_URL at the deployed API origin. (As of the API's v19.1
// CORS update, direct cross-origin calls work too if you'd rather skip the
// proxy — see .env.example.)
const baseURL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export const apiClient = axios.create({ baseURL });

// A second, bare client for the refresh call itself — it must never carry
// the 401-handling interceptor below, or a failed refresh would try to
// refresh itself. It still needs the tenant header attached separately,
// since every /api request requires one (see attachTenantHeader below).
const refreshClient = axios.create({ baseURL });

// Every /api request requires X-Tenant-Key — tenant resolution runs before
// authentication server-side, so this applies even to login/select-context/
// refresh/logout, not just authenticated calls. LoginPage sets the tenant
// store synchronously right before calling login(), so by the time any
// request actually goes out there's a value to attach here; a request
// that somehow still lacks one will get the API's own 400 "tenant header
// required" response.
function attachTenantHeader(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const tenantKey = useTenantStore.getState().tenantKey;
  if (tenantKey) {
    config.headers.set("X-Tenant-Key", tenantKey);
  }
  return config;
}

apiClient.interceptors.request.use((config) => {
  attachTenantHeader(config);
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

refreshClient.interceptors.request.use(attachTenantHeader);

// The API rotates the refresh token on every use and revokes the whole
// token family if a used token is replayed (see AuthService.RefreshAsync).
// That makes concurrent refreshes actively dangerous: two requests racing
// to refresh with the same token will cause the second to look like reuse.
// So every 401 funnels through this single in-flight promise, and any
// request that arrives mid-refresh just waits for it instead of firing its
// own refresh call.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return null;

  try {
    const { data } = await refreshClient.post<RefreshResponse>("/auth/refresh", {
      refreshToken,
    });
    if (!data.succeeded || !data.accessToken || !data.refreshToken) {
      return null;
    }
    useAuthStore.getState().setTokens({
      accessToken: data.accessToken,
      accessTokenExpiresAtUtc: data.accessTokenExpiresAtUtc ?? null,
      refreshToken: data.refreshToken,
      refreshTokenExpiresAtUtc: data.refreshTokenExpiresAtUtc ?? null,
    });
    return data.accessToken;
  } catch {
    return null;
  }
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;
    const status = error.response?.status;

    // Never retry the refresh/login/select-context calls themselves, and
    // never retry a request more than once.
    const isAuthEndpoint = config?.url?.startsWith("/auth/");
    if (status !== 401 || !config || config._retried || isAuthEndpoint) {
      return Promise.reject(error);
    }

    config._retried = true;
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    const newToken = await refreshPromise;
    if (!newToken) {
      // Refresh token is dead too — this session is over.
      useAuthStore.getState().signOut();
      return Promise.reject(error);
    }

    config.headers.set("Authorization", `Bearer ${newToken}`);
    return apiClient(config);
  },
);
