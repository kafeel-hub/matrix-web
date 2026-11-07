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

export const saveGoldPaymentVoucher = ({ request, ...options }) =>
  send("/gold-payment-vouchers", { ...options, method: "POST", body: request });

export const getGoldPaymentVoucherLookups = (options) =>
  send("/gold-payment-vouchers/lookups", options);

export const searchGoldPaymentVoucherAccounts = ({ search = "", page = 1, pageSize = 50, ...options }) =>
  send(`/accounts/search?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`, options);

export const listGoldPaymentVouchers = ({ date, ...options }) =>
  send(`/gold-payment-vouchers?date=${encodeURIComponent(date)}`, options);

export const getGoldPaymentVoucher = ({ voucherNo, ...options }) =>
  send(`/gold-payment-vouchers/${encodeURIComponent(voucherNo)}`, options);

export const searchGoldPaymentParties = ({ search = "", take = 100, ...options }) =>
  send(`/gold-payment-vouchers/parties?search=${encodeURIComponent(search)}&take=${take}`, options);

export const getGoldPaymentParty = ({ partyType, partyId, ...options }) =>
  send(`/gold-payment-vouchers/parties/${encodeURIComponent(partyType)}/${encodeURIComponent(partyId)}`, options);

export const searchGoldPaymentItems = ({ search = "", page = 1, pageSize = 100, ...options }) =>
  send(`/gold-payment-vouchers/items?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`, options);

export const getGoldPaymentItem = ({ itemId, ...options }) =>
  send(`/gold-payment-vouchers/items/${encodeURIComponent(itemId)}`, options);
