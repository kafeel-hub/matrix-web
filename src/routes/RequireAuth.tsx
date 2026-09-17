import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/auth/auth-store";

/**
 * Gates any nested route on auth.status === "ready". Sends the user to
 * whichever earlier step of the flow they're actually in, rather than a
 * single generic "/login" redirect — someone who's authenticated but
 * hasn't picked a company/location should land on the picker, not be
 * asked to re-enter credentials.
 */
export function RequireAuth() {
  const auth = useAuthStore((s) => s.auth);

  if (auth.status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }
  if (auth.status === "awaiting-context") {
    return <Navigate to="/select-context" replace />;
  }
  return <Outlet />;
}
