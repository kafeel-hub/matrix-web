import { useAuthStore } from "@/auth/auth-store";

export function DashboardPage() {
  const auth = useAuthStore((s) => s.auth);
  if (auth.status !== "ready") return null;

  const { context, modules } = auth;

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">
        {context.companySettings.currencySymbol ?? ""} Welcome back
      </h1>
      <p className="mt-1 text-ink-700/70">
        Financial year {context.financialYear.yearNo} · {context.financialYear.openStatus}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(Object.keys(modules) as Array<keyof typeof modules>)
          .filter((key) => modules[key])
          .map((key) => (
            <div key={key} className="rounded-lg border border-ink-900/10 bg-parchment-100/40 p-4">
              <p className="text-sm font-medium capitalize text-ink-900">{key}</p>
              <p className="mt-1 text-xs text-ink-700/60">Module enabled</p>
            </div>
          ))}
      </div>

      <p className="mt-8 text-sm text-ink-700/50">
        This is a placeholder landing page — build out sales, customer, and
        inventory screens under <code className="rounded bg-ink-900/5 px-1 py-0.5">src/routes</code> and{" "}
        <code className="rounded bg-ink-900/5 px-1 py-0.5">src/modules</code>.
      </p>
    </div>
  );
}
