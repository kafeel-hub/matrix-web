import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * The organization/tenant code, persisted independently of the auth
 * session. Every /api request requires this as the X-Tenant-Key header
 * (see api/client.ts) — including login itself, since tenant resolution
 * happens before authentication server-side. It survives a normal sign-out
 * (so the same person/org doesn't retype it every session) but must be
 * cleared whenever the person explicitly switches organizations, since a
 * session token issued under one tenant is rejected under another.
 */
interface TenantStore {
  tenantKey: string | null;
  setTenantKey: (key: string) => void;
  clearTenantKey: () => void;
}

export const useTenantStore = create<TenantStore>()(
  persist(
    (set) => ({
      tenantKey: null,
      setTenantKey: (key) => set({ tenantKey: key.trim() }),
      clearTenantKey: () => set({ tenantKey: null }),
    }),
    { name: "matrix-tenant" },
  ),
);
