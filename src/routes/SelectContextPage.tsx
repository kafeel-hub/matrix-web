import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/auth/auth-store";
import { useSelectContext } from "@/auth/use-auth";
import { Button } from "@/shared/components/Button";
import { SelectField } from "@/shared/components/SelectField";
import backgroundImage from "@/assets/images/background.jpg";

export function SelectContextPage() {
  const auth = useAuthStore((s) => s.auth);
  const selectContext = useSelectContext();
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState<number | "">("");
  const [locationId, setLocationId] = useState<number | "">("");

  // Guard: this page only makes sense mid-flow. If someone lands here
  // directly (deep link, refresh — though we deliberately don't persist
  // this state, see auth-store.ts) bounce them back to login. This has to
  // come after every hook above it (useState) and before any plain,
  // non-hook derived values below (companies.find isn't a hook, so it's
  // fine positioned after this return — a genuine useMemo would not be).
  if (auth.status !== "awaiting-context") {
    return <Navigate to="/login" replace />;
  }

  const companies = auth.companies;
  // Two cascading dropdowns instead of every company's every location laid
  // out as one long list of buttons — company first, then only that
  // company's locations, matching the pattern already used for jewel-besto
  // -web's equivalent screen. companies.find() over a handful of rows is
  // cheap enough that this doesn't need useMemo.
  const selectedCompany = companies.find((c) => c.companyId === companyId);
  const locationOptions = selectedCompany?.locations ?? [];

  function handleCompanyChange(value: string) {
    const id = value === "" ? "" : Number(value);
    setCompanyId(id);
    setLocationId(""); // company changed -> old location choice no longer valid
  }

  async function handleContinue() {
    if (companyId === "" || locationId === "" || auth.status !== "awaiting-context") return;
    const response = await selectContext.mutateAsync({
      preAuthToken: auth.preAuthToken,
      companyId,
      locationId,
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-parchment-50 px-4">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="font-display text-2xl text-ink-900">Choose where you're working</p>
          <p className="mt-1 text-sm text-ink-700/60">Signed in as {auth.user.userName}</p>
        </div>

        <div className="rounded-lg border border-ink-900/10 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <SelectField
              label="Company"
              value={companyId}
              onChange={(e) => handleCompanyChange(e.target.value)}
            >
              <option value="">Select a company…</option>
              {companies.map((company) => (
                <option key={company.companyId} value={company.companyId}>
                  {company.companyName}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Location"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={!selectedCompany}
            >
              <option value="">{selectedCompany ? "Select a location…" : "Choose a company first"}</option>
              {locationOptions.map((location) => (
                <option key={location.locationId} value={location.locationId}>
                  {location.locationName}
                </option>
              ))}
            </SelectField>
          </div>

          {errorMessage && (
            <p role="alert" className="mt-3 text-sm text-error-600">
              {errorMessage}
            </p>
          )}

          <Button
            onClick={handleContinue}
            disabled={companyId === "" || locationId === ""}
            loading={selectContext.isPending}
            className="mt-5 w-full justify-center"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
