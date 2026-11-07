import { refresh as refreshSession } from './matrixAuthApi';

const base = (import.meta.env.VITE_MATRIX_API_BASE_URL || '/api').replace(/\/$/, '');
let refreshPromise = null;

async function send(path, { method = 'GET', body, session, onSessionRefreshed } = {}) {
  const call = (token) => fetch(`${base}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      'X-Tenant-Key': session.tenantKey,
      Authorization: `Bearer ${token}`,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  let response = await call(session.accessToken);
  if (response.status === 401 && session.refreshToken) {
    if (!refreshPromise) refreshPromise = refreshSession({ tenantKey: session.tenantKey, refreshToken: session.refreshToken }).finally(() => { refreshPromise = null; });
    const next = await refreshPromise;
    if (!next?.succeeded) throw new Error(next?.error || 'Session expired.');
    onSessionRefreshed?.(next);
    response = await call(next.accessToken);
  }
  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try { const data = await response.json(); message = data?.message || data?.detail || message; } catch { /* keep fallback */ }
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
}

export const getStatus = (options) => send('/finance-closing/status', options);
export const partialMonthClose = (monthNo, options) => send('/finance-closing/month/partial', { ...options, method: 'POST', body: { monthNo } });
export const fullMonthClose = (monthNo, options) => send('/finance-closing/month/full', { ...options, method: 'POST', body: { monthNo } });
export const yearEnd = (body, options) => send('/finance-closing/year-end', { ...options, method: 'POST', body });
