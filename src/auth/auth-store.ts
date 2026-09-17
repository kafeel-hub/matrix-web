import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BootstrapLookups,
  CompanyInfo,
  ContextInfo,
  LoginResponse,
  ModuleAccessInfo,
  UserInfo,
} from "@/types/auth";

// The three states from the product discussion, made explicit as a
// discriminated union so a component can `switch` on `status` and the
// compiler guarantees every branch is handled — no scattered
// `if (token && !context)` checks spread across the app.
export type AuthState =
  | { status: "unauthenticated" }
  | {
      status: "awaiting-context";
      preAuthToken: string;
      user: UserInfo;
      companies: CompanyInfo[];
    }
  | {
      status: "ready";
      user: UserInfo;
      context: ContextInfo;
      modules: ModuleAccessInfo;
      lookups: BootstrapLookups;
      companies: CompanyInfo[];
    };

interface TokenPair {
  accessToken: string;
  accessTokenExpiresAtUtc: string | null;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string | null;
}

interface AuthStore {
  auth: AuthState;
  accessToken: string | null;
  accessTokenExpiresAtUtc: string | null;
  refreshToken: string | null;
  refreshTokenExpiresAtUtc: string | null;

  /** Apply a LoginResponse from either /login or /select-context. */
  applyLoginResponse: (response: LoginResponse) => void;
  setTokens: (tokens: TokenPair) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      auth: { status: "unauthenticated" },
      accessToken: null,
      accessTokenExpiresAtUtc: null,
      refreshToken: null,
      refreshTokenExpiresAtUtc: null,

      applyLoginResponse: (response) => {
        if (!response.succeeded) return;

        if (response.requiresContextSelection) {
          set({
            auth: {
              status: "awaiting-context",
              preAuthToken: response.preAuthToken!,
              user: response.user!,
              companies: response.companies,
            },
            // No session tokens yet — the pre-auth token isn't a bearer
            // token and isn't sent via the Authorization header.
            accessToken: null,
            accessTokenExpiresAtUtc: null,
            refreshToken: null,
            refreshTokenExpiresAtUtc: null,
          });
          return;
        }

        // Fully bootstrapped: either login() resolved a single company +
        // location automatically, or this came back from select-context().
        set({
          auth: {
            status: "ready",
            user: response.user!,
            context: response.context!,
            modules: response.modules!,
            lookups: response.lookups!,
            companies: response.companies,
          },
          accessToken: response.accessToken ?? null,
          accessTokenExpiresAtUtc: response.accessTokenExpiresAtUtc ?? null,
          refreshToken: response.refreshToken ?? null,
          refreshTokenExpiresAtUtc: response.refreshTokenExpiresAtUtc ?? null,
        });
      },

      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          accessTokenExpiresAtUtc: tokens.accessTokenExpiresAtUtc,
          refreshToken: tokens.refreshToken,
          refreshTokenExpiresAtUtc: tokens.refreshTokenExpiresAtUtc,
        }),

      signOut: () =>
        set({
          auth: { status: "unauthenticated" },
          accessToken: null,
          accessTokenExpiresAtUtc: null,
          refreshToken: null,
          refreshTokenExpiresAtUtc: null,
        }),
    }),
    {
      name: "matrix-auth",
      // Persist the ready session and its tokens across page refreshes.
      // Deliberately NOT persisting "awaiting-context": the pre-auth token
      // is short-lived (5 minutes server-side) and single-use, so surviving
      // a refresh only to hit an expired/consumed token is a worse UX than
      // just asking the user to log in again.
      partialize: (state) => ({
        auth: state.auth.status === "ready" ? state.auth : { status: "unauthenticated" as const },
        accessToken: state.auth.status === "ready" ? state.accessToken : null,
        accessTokenExpiresAtUtc: state.auth.status === "ready" ? state.accessTokenExpiresAtUtc : null,
        refreshToken: state.auth.status === "ready" ? state.refreshToken : null,
        refreshTokenExpiresAtUtc: state.auth.status === "ready" ? state.refreshTokenExpiresAtUtc : null,
      }),
    },
  ),
);
