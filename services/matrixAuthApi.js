const configuredBase = import.meta.env.VITE_MATRIX_API_BASE_URL || "/api";
const baseUrl = configuredBase.replace(/\/$/, "");

const readError = async (response) => {
  try {
    const body = await response.json();
    return body?.error || body?.detail || body?.title || body?.message || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
};

const post = async (path, body, tenantKey, token) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(tenantKey ? { "X-Tenant-Key": tenantKey } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
};

export const login = ({ tenantKey, userName, password }) =>
  post("/auth/login", { userName, password }, tenantKey);

export const selectContext = ({ tenantKey, preAuthToken, companyId, locationId }) =>
  post("/auth/select-context", { preAuthToken, companyId: Number(companyId), locationId: Number(locationId) }, tenantKey);

export const refresh = ({ tenantKey, refreshToken }) =>
  post("/auth/refresh", { refreshToken }, tenantKey);

export const logout = ({ tenantKey, refreshToken }) =>
  post("/auth/logout", { refreshToken }, tenantKey);
