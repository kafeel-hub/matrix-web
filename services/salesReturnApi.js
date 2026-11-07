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
  } catch { return `Request failed (${response.status})`; }
};

const rotate = async (session, onSessionRefreshed) => {
  if (!refreshPromise) {
    refreshPromise = refreshSession({ tenantKey: session.tenantKey, refreshToken: session.refreshToken })
      .finally(() => { refreshPromise = null; });
  }
  const refreshed = await refreshPromise;
  if (!refreshed?.succeeded) throw new Error(refreshed?.error || "Your session has expired.");
  onSessionRefreshed?.(refreshed);
  return refreshed;
};

const send = async (path, { method = "GET", body, session, signal, onSessionRefreshed } = {}) => {
  const invoke = (token) => fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      "X-Tenant-Key": session.tenantKey,
      Authorization: `Bearer ${token}`,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}), signal,
  });
  let response = await invoke(session.accessToken);
  if (response.status === 401 && session.refreshToken) {
    const refreshed = await rotate(session, onSessionRefreshed);
    response = await invoke(refreshed.accessToken);
  }
  if (!response.ok) throw new Error(await readError(response));
  return response.status === 204 ? null : response.json();
};

export const listOriginalInvoices = ({ date, civilId, mobileNo, ...options }) => {
  const q = new URLSearchParams();
  if (date) q.set("date", date);
  if (civilId) q.set("civilId", civilId);
  if (mobileNo) q.set("mobileNo", mobileNo);
  return send(`/sales-returns/original-invoices?${q.toString()}`, options);
};
export const getOriginalInvoice = ({ transactionNo, ...options }) =>
  send(`/sales-returns/original-invoices/${encodeURIComponent(transactionNo)}`, options);
export const saveSalesReturn = ({ request, ...options }) =>
  send("/sales-returns", { ...options, method: "POST", body: request });

export const listSalesReturns = ({ date, ...options }) =>
  send(`/sales-returns?date=${encodeURIComponent(date)}`, options);
export const getSalesReturn = ({ transactionNo, ...options }) =>
  send(`/sales-returns/${encodeURIComponent(transactionNo)}`, options);
