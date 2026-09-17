import { useMutation } from "@tanstack/react-query";
import * as authApi from "@/api/auth";
import { useAuthStore } from "./auth-store";

export function useLogin() {
  const applyLoginResponse = useAuthStore((s) => s.applyLoginResponse);

  return useMutation({
    mutationFn: ({ userName, password }: { userName: string; password: string }) =>
      authApi.login(userName, password),
    onSuccess: (outcome) => {
      if (outcome.kind === "response" && outcome.response.succeeded) {
        applyLoginResponse(outcome.response);
      }
    },
  });
}

export function useSelectContext() {
  const applyLoginResponse = useAuthStore((s) => s.applyLoginResponse);

  return useMutation({
    mutationFn: ({
      preAuthToken,
      companyId,
      locationId,
    }: {
      preAuthToken: string;
      companyId: number;
      locationId: number;
    }) => authApi.selectContext(preAuthToken, companyId, locationId),
    onSuccess: (response) => {
      if (response.succeeded) applyLoginResponse(response);
    },
  });
}

export function useLogout() {
  const signOut = useAuthStore((s) => s.signOut);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  return useMutation({
    mutationFn: () => authApi.logout(refreshToken ?? ""),
    // Sign out locally regardless of whether the network call lands — an
    // expired/offline logout shouldn't trap the user in the app.
    onSettled: () => signOut(),
  });
}

/**
 * Revokes every refresh token for this user across all sessions/devices
 * (POST /auth/logout-all), then signs out locally same as useLogout. Unlike
 * plain logout, this one needs a valid access token to authenticate the
 * call in the first place — if the access token has already expired and
 * the refresh call also fails, there's nothing left to authenticate a
 * server-side revocation with, so this still signs out locally regardless.
 */
export function useLogoutAll() {
  const signOut = useAuthStore((s) => s.signOut);

  return useMutation({
    mutationFn: () => authApi.logoutAll(),
    onSettled: () => signOut(),
  });
}
