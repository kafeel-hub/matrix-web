import { refresh as refreshSession } from "./matrixAuthApi";

const configuredBase = import.meta.env.VITE_MATRIX_API_BASE_URL || "/api";
const baseUrl = configuredBase.replace(/\/$/, "");
let refreshPromise = null;

const readError = async (response) => {
  try {
    const body = await response.json();
    if (Array.isArray(body?.errors)) {
      const msg = body.errors.map((x) => x.message || x.code).filter(Boolean).join("\n");
      if (msg) return msg;
    }
    if (body?.errors && typeof body.errors === "object") {
      const msg = Object.values(body.errors).flat().filter(Boolean).join("\n");
      if (msg) return msg;
    }
    return body?.detail || body?.message || body?.title || `Request failed (${response.status})`;
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
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    signal,
  });
  let response = await invoke(session.accessToken);
  if (response.status === 401 && session.refreshToken) {
    const refreshed = await rotate(session, onSessionRefreshed);
    response = await invoke(refreshed.accessToken);
  }
  if (!response.ok) throw new Error(await readError(response));
  return response.status === 204 ? null : response.json();
};

export const listItemTypes = (options) => send("/item-types", options);
export const getItemType = ({ itemTypeId, ...options }) => send(`/item-types/${encodeURIComponent(itemTypeId)}`, options);
export const createItemType = ({ request, ...options }) => send("/item-types", { ...options, method: "POST", body: request });
export const updateItemType = ({ itemTypeId, request, ...options }) => send(`/item-types/${encodeURIComponent(itemTypeId)}`, { ...options, method: "PUT", body: request });
export const deactivateItemType = ({ itemTypeId, ...options }) => send(`/item-types/${encodeURIComponent(itemTypeId)}`, { ...options, method: "DELETE" });

export const listItemCategories = ({ itemTypeId = "", ...options }) =>
  send(`/item-categories${itemTypeId ? `?itemTypeId=${encodeURIComponent(itemTypeId)}` : ""}`, options);
export const getItemCategory = ({ categoryId, ...options }) => send(`/item-categories/${encodeURIComponent(categoryId)}`, options);
export const createItemCategory = ({ request, ...options }) => send("/item-categories", { ...options, method: "POST", body: request });
export const updateItemCategory = ({ categoryId, request, ...options }) => send(`/item-categories/${encodeURIComponent(categoryId)}`, { ...options, method: "PUT", body: request });
export const deactivateItemCategory = ({ categoryId, ...options }) => send(`/item-categories/${encodeURIComponent(categoryId)}`, { ...options, method: "DELETE" });
