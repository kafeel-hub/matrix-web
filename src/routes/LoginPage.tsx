import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "@/auth/use-auth";
import { Button } from "@/shared/components/Button";
import { useAuthStore } from "@/auth/auth-store";
import { useTenantStore } from "@/tenant/tenant-store";

export function LoginPage() {
  const tenantKey = useTenantStore((s) => s.tenantKey);
  const setTenantKey = useTenantStore((s) => s.setTenantKey);
  const signOut = useAuthStore((s) => s.signOut);

  const [organization, setOrganization] = useState(tenantKey ?? "");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const navigate = useNavigate();
  const authState = useAuthStore((s) => s.auth);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const org = organization.trim();

    // Switching organizations invalidates any existing session — a token
    // issued under one tenant is server-rejected under another (see
    // Program.cs's OnTokenValidated check) — so there's nothing to
    // preserve by keeping old session state around once the org changes.
    if (tenantKey && org !== tenantKey) signOut();
    setTenantKey(org);

    // setTenantKey updates the store synchronously, and api/client.ts reads
    // the current value fresh on every request, so the login call below
    // picks up the org just set here even though React state hasn't
    // re-rendered yet.
    const outcome = await login.mutateAsync({ userName, password });
    if (outcome.kind !== "response" || !outcome.response.succeeded) return; // error surfaces below

    if (outcome.response.requiresContextSelection) {
      navigate("/select-context", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }

  // A rejected mutation (network/5xx) throws; a *business* failure like
  // "invalid credentials" comes back as {succeeded:false, error} with a 200;
  // a *tenant* failure (wrong organization code) comes back as a 400/404
  // with a differently-shaped body — see api/auth.ts's login(). All three
  // need different guidance, but all three surface right here since the
  // organization field lives on this same form now.
  const outcome = login.data;
  const businessError =
    outcome?.kind === "response" && !outcome.response.succeeded ? outcome.response.error : null;
  const tenantError = outcome?.kind === "tenant-error" ? outcome.message : null;
  const networkError = login.isError ? "Couldn't reach the server. Check your connection and try again." : null;
  const errorMessage = tenantError ?? businessError ?? networkError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl text-parchment-100">Matrix</p>
          <p className="mt-1 text-sm text-parchment-100/50">Sign in to continue</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-parchment-100/10 bg-ink-900 p-6"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="organization" className="text-sm font-medium text-parchment-100/80">
                Organization code
              </label>
              <input
                id="organization"
                name="organization"
                autoFocus={!tenantKey}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. plaza"
                className="rounded-md border border-parchment-100/15 bg-ink-950 px-3 py-2 text-parchment-50 placeholder:text-parchment-100/30 focus-visible:border-brass-500"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="userName" className="text-sm font-medium text-parchment-100/80">
                User name
              </label>
              <input
                id="userName"
                name="userName"
                autoComplete="username"
                autoFocus={Boolean(tenantKey)}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="rounded-md border border-parchment-100/15 bg-ink-950 px-3 py-2 text-parchment-50 placeholder:text-parchment-100/30 focus-visible:border-brass-500"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-parchment-100/80">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-md border border-parchment-100/15 bg-ink-950 px-3 py-2 text-parchment-50 placeholder:text-parchment-100/30 focus-visible:border-brass-500"
                required
              />
            </div>

            {errorMessage && (
              <p role="alert" className="text-sm text-[#e08370]">
                {errorMessage}
              </p>
            )}

            <Button type="submit" loading={login.isPending} className="mt-2 justify-center">
              {login.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </div>
        </form>

        {authState.status === "awaiting-context" && (
          <p className="mt-4 text-center text-sm text-parchment-100/50">
            Signed in — choose a company and location to continue.
          </p>
        )}
      </div>
    </div>
  );
}
