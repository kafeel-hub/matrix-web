import { refresh as refreshSession } from "./matrixAuthApi";

const base = (import.meta.env.VITE_MATRIX_API_BASE_URL || "/api").replace(/\/$/, "");
let refreshPromise = null;

async function getErrorMessage(response) {
  try {
    const body = await response.json();
    return body?.message || body?.detail || body?.title || `Request failed (${response.status}).`;
  } catch {
    return `Request failed (${response.status}).`;
  }
}

async function send(path, { method = "GET", body, session, onSessionRefreshed } = {}) {
  const call = (token) =>
    fetch(`${base}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        "X-Tenant-Key": session.tenantKey,
        Authorization: `Bearer ${token}`,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

  let response = await call(session.accessToken);

  if (response.status === 401 && session.refreshToken) {
    if (!refreshPromise) {
      refreshPromise = refreshSession({
        tenantKey: session.tenantKey,
        refreshToken: session.refreshToken,
      }).finally(() => {
        refreshPromise = null;
      });
    }

    const nextSession = await refreshPromise;
    if (!nextSession?.succeeded) {
      throw new Error(nextSession?.error || "Session expired.");
    }

    onSessionRefreshed?.(nextSession);
    response = await call(nextSession.accessToken);
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.status === 204 ? null : response.json();
}

export const getList = (fromDate, toDate, options) =>
  send(
    `/wastage-vouchers?fromDate=${encodeURIComponent(fromDate || "")}&toDate=${encodeURIComponent(toDate || "")}`,
    options,
  );

export const getOne = (voucherNo, options) =>
  send(`/wastage-vouchers/${voucherNo}`, options);

export const create = (body, options) =>
  send("/wastage-vouchers", { ...options, method: "POST", body });

export const update = (voucherNo, body, options) =>
  send(`/wastage-vouchers/${voucherNo}`, { ...options, method: "PUT", body });

export const remove = (voucherNo, options) =>
  send(`/wastage-vouchers/${voucherNo}`, { ...options, method: "DELETE" });
