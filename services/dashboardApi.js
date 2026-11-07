import { refresh as refreshSession } from "./matrixAuthApi";

const configuredBase = import.meta.env.VITE_MATRIX_API_BASE_URL || "/api";
const baseUrl = configuredBase.replace(/\/$/, "");

const buildQuery = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  return query.toString();
};

const errorMessage = async (response, fallback) => {
  try {
    const body = await response.json();
    return body?.error || body?.detail || body?.title || body?.message || fallback;
  } catch { return fallback; }
};

const doGet = (path, token, tenantKey, signal) => fetch(`${baseUrl}${path}`, {
  method: "GET",
  headers: {
    Accept: "application/json",
    "X-Tenant-Key": tenantKey,
    Authorization: `Bearer ${token}`,
  },
  signal,
});

let refreshPromise = null;

const rotateSession = async (session, onSessionRefreshed) => {
  if (!refreshPromise) {
    refreshPromise = refreshSession({ tenantKey: session.tenantKey, refreshToken: session.refreshToken })
      .finally(() => { refreshPromise = null; });
  }
  const refreshed = await refreshPromise;
  if (!refreshed?.succeeded) throw new Error(refreshed?.error || "Your session has expired.");
  onSessionRefreshed?.(refreshed);
  return refreshed;
};

const request = async (path, session, signal, onSessionRefreshed) => {
  let response = await doGet(path, session.accessToken, session.tenantKey, signal);

  if (response.status === 401 && session.refreshToken) {
    const refreshed = await rotateSession(session, onSessionRefreshed);
    response = await doGet(path, refreshed.accessToken, session.tenantKey, signal);
  }

  if (!response.ok) {
    throw new Error(await errorMessage(response, `Dashboard request failed (${response.status})`));
  }
  return response.json();
};

export const getDashboard = ({ dateFrom, dateTo, session, signal, onSessionRefreshed }) =>
  request(`/dashboard?${buildQuery({ dateFrom, dateTo })}`, session, signal, onSessionRefreshed);

export const getDashboardAnalytics = ({ dateFrom, dateTo, groupBy, session, signal, onSessionRefreshed }) =>
  request(`/dashboard/analytics?${buildQuery({ dateFrom, dateTo, groupBy })}`, session, signal, onSessionRefreshed);
