import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/auth/auth-store";
import { useSelectContext } from "@/auth/use-auth";
import { Button } from "@/shared/components/Button";

export function SelectContextPage() {
  const auth = useAuthStore((s) => s.auth);
  const selectContext = useSelectContext();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<{ companyId: number; locationId: number } | null>(null);

  // Guard: this page only makes sense mid-flow. If someone lands here
  // directly (deep link, refresh — though we deliberately don't persist
  // this state, see auth-store.ts) bounce them back to login.
  if (auth.status !== "awaiting-context") {
    return <Navigate to="/login" replace />;
  }

  async function handleContinue() {
    if (!selected || auth.status !== "awaiting-context") return;
    const response = await selectContext.mutateAsync({
      preAuthToken: auth.preAuthToken,
      companyId: selected.companyId,
      locationId: selected.locationId,
    });
    if (response.succeeded) navigate("/", { replace: true });
  }

  const errorMessage =
    selectContext.data && !selectContext.data.succeeded
      ? selectContext.data.error
      : selectContext.isError
        ? "Couldn't reach the server. Check your connection and try again."
        : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="font-display text-2xl text-parchment-100">Choose where you're working</p>
          <p className="mt-1 text-sm text-parchment-100/50">
            Signed in as {auth.user.userName}
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-parchment-100/10 bg-ink-900 p-4">
          {auth.companies.map((company) => (
            <div key={company.companyId}>
              <p className="px-1 pb-2 text-xs font-medium uppercase tracking-wide text-parchment-100/40">
                {company.companyName}
              </p>
              <div className="flex flex-col gap-1.5">
                {company.locations.map((location) => {
                  const isSelected =
                    selected?.companyId === company.companyId &&
                    selected?.locationId === location.locationId;
                  return (
                    <button
                      key={location.locationId}
                      type="button"
                      onClick={() =>
                        setSelected({ companyId: company.companyId, locationId: location.locationId })
                      }
                      className={`rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${
                        isSelected
                          ? "border-brass-500 bg-brass-500/10 text-parchment-50"
                          : "border-parchment-100/10 text-parchment-100/80 hover:border-parchment-100/25"
                      }`}
                    >
                      {location.locationName}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {errorMessage && (
          <p role="alert" className="mt-3 text-sm text-[#e08370]">
            {errorMessage}
          </p>
        )}

        <Button
          onClick={handleContinue}
          disabled={!selected}
          loading={selectContext.isPending}
          className="mt-4 w-full justify-center"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
