import { refresh as refreshSession } from "./matrixAuthApi";

const configuredBase = import.meta.env.VITE_MATRIX_API_BASE_URL || "/api";
const baseUrl = configuredBase.replace(/\/$/, "");
let refreshPromise = null;

const readError = async (response) => {
  try {
    const body = await response.json();
    const validation = Array.isArray(body?.errors)
      ? body.errors.map((x) => x.message || x.code).filter(Boolean).join("\n")
      : "";
    return validation || body?.detail || body?.message || body?.title || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
};

const rotate = async (session, onSessionRefreshed) => {
  if (!refreshPromise) {
    refreshPromise = refreshSession({
      tenantKey: session.tenantKey,
      refreshToken: session.refreshToken,
    }).finally(() => { refreshPromise = null; });
  }
  const refreshed = await refreshPromise;
  if (!refreshed?.succeeded) throw new Error(refreshed?.error || "Your session has expired.");
  onSessionRefreshed?.(refreshed);
  return refreshed;
};

const send = async (path, { session, signal, onSessionRefreshed } = {}) => {
  const invoke = (token) => fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "X-Tenant-Key": session.tenantKey,
      Authorization: `Bearer ${token}`,
    },
    signal,
  });
  let response = await invoke(session.accessToken);
  if (response.status === 401 && session.refreshToken) {
    const refreshed = await rotate(session, onSessionRefreshed);
    response = await invoke(refreshed.accessToken);
  }
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
};

export const getAccountBalance = ({ accountNo, ...options }) => {
  if (!accountNo) return Promise.resolve({ accountNo: "", amountBalance: 0, goldBalance: 0 });
  return send(`/accounts/${encodeURIComponent(accountNo)}/balance`, options);
};
