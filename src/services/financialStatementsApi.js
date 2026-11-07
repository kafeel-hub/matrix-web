import { refresh as refreshSession } from './matrixAuthApi';

const base = (import.meta.env.VITE_MATRIX_API_BASE_URL || '/api').replace(/\/$/, '');
let refreshPromise = null;

async function send(path, body, { session, onSessionRefreshed }) {
  const call = (token) =>
    fetch(`${base}${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Tenant-Key': session.tenantKey,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
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
    const next = await refreshPromise;
    if (!next?.succeeded) throw new Error(next?.error || 'Session expired.');
    onSessionRefreshed?.(next);
    response = await call(next.accessToken);
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const data = await response.json();
      message = data?.message || data?.detail || data?.title || message;
    } catch {
      // Keep fallback message.
    }
    throw new Error(message);
  }
  return response.json();
}

async function get(path, { session, onSessionRefreshed }) {
  const call = (token) =>
    fetch(`${base}${path}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Tenant-Key': session.tenantKey,
        Authorization: `Bearer ${token}`,
      },
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
    const next = await refreshPromise;
    if (!next?.succeeded) throw new Error(next?.error || 'Session expired.');
    onSessionRefreshed?.(next);
    response = await call(next.accessToken);
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const data = await response.json();
      message = data?.message || data?.detail || data?.title || message;
    } catch {
      // Keep fallback message.
    }
    throw new Error(message);
  }
  return response.json();
}

export const getTrialBalance = (body, options) =>
  send('/finance-statements/trial-balance', body, options);

export const getProfitLoss = (body, options) =>
  send('/finance-statements/profit-loss', body, options);

export const getTrialBalanceLookups = (options) =>
  get('/finance-statements/trial-balance/lookups', options);
