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

const qs = (values) => {
  const p = new URLSearchParams();
  Object.entries(values).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const listItems = ({ search = "", itemTypeId = "", categoryId = "", subcategoryId = "", page = 1, pageSize = 100, ...options }) =>
  send(`/items${qs({ search, itemTypeId, categoryId, subcategoryId, page, pageSize })}`, options);
export const getItem = ({ itemId, ...options }) => send(`/items/${encodeURIComponent(itemId)}`, options);
export const getNextItemCode = ({ itemTypeId, categoryId, subcategoryId = "", ...options }) =>
  send(`/items/next-code${qs({ itemTypeId, categoryId, subcategoryId })}`, options);
export const createItem = ({ request, ...options }) => send("/items", { ...options, method: "POST", body: request });
export const updateItem = ({ itemId, request, ...options }) => send(`/items/${encodeURIComponent(itemId)}`, { ...options, method: "PUT", body: request });
export const deactivateItem = ({ itemId, ...options }) => send(`/items/${encodeURIComponent(itemId)}`, { ...options, method: "DELETE" });

export const listItemTypes = (options) => send("/item-types", options);
export const listItemCategories = ({ itemTypeId = "", ...options }) => send(`/item-categories${qs({ itemTypeId })}`, options);
export const listItemSubcategories = ({ categoryId = "", ...options }) => send(`/item-subcategories${qs({ categoryId })}`, options);
export const listGoldPurities = (options) => send("/gold-purities", options);
export const listItemDesigns = (options) => send("/item-designs", options);
export const listCountries = (options) => send("/countries", options);
export const listSuppliers = ({ term = "", take = 200, ...options }) => send(`/suppliers${qs({ term, take })}`, options);
