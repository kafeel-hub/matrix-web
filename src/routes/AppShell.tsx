import { NavLink, Link, Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "@/auth/auth-store";
import { useLogout, useLogoutAll } from "@/auth/use-auth";
import { useTenantStore } from "@/tenant/tenant-store";
import { Button } from "@/shared/components/Button";
import type { ModuleAccessInfo } from "@/types/auth";

const salesItems = [
  { to: "/sales/new", label: "New sale" },
  { to: "/sales/returns/new", label: "Sales return" },
  { to: "/sales/unfixed/new", label: "Unfixed sale" },
  { to: "/sales/gold-fixing/new", label: "Gold fixing voucher" },
  { to: "/customers", label: "Customers" },
];
const purchaseItems = [
  { to: "/suppliers", label: "Suppliers" },
  { to: "/purchases/scrap/new", label: "Scrap purchase" },
  { to: "/purchases/unfixed/new", label: "Unfixed purchase" },
  { to: "/purchases/gold-fixing/new", label: "Gold fixing voucher" },
];
const financeItems = [
  { to: "/accounts", label: "Accounts" },
  { to: "/finance/receipt-voucher/new", label: "Receipt voucher" },
  { to: "/finance/payment-voucher/new", label: "Payment voucher" },
  { to: "/finance/gold-receipt-voucher/new", label: "Gold receipt voucher" },
  { to: "/finance/gold-payment-voucher/new", label: "Gold payment voucher" },
  { to: "/finance/petty-cash/new", label: "Petty cash" },
];

const settingsItems = [
  { to: "/settings/payment-types", label: "Payment types", module: "administration" as const, section: "General" },
  { to: "/settings/currencies", label: "Currencies", module: "administration" as const, section: "General" },
  { to: "/settings/countries", label: "Countries", module: "administration" as const, section: "General" },
  { to: "/settings/areas", label: "Areas", module: "administration" as const, section: "General" },
  { to: "/settings/salesmen", label: "Salesmen", module: "administration" as const, section: "General" },
  { to: "/settings/item-types", label: "Item types", module: "inventory" as const, section: "Inventory" },
  { to: "/settings/item-categories", label: "Item categories", module: "inventory" as const, section: "Inventory" },
  { to: "/settings/item-subcategories", label: "Item subcategories", module: "inventory" as const, section: "Inventory" },
  { to: "/settings/gold-purities", label: "Gold purities", module: "inventory" as const, section: "Inventory" },
  { to: "/settings/item-designs", label: "Item designs", module: "inventory" as const, section: "Inventory" },
];

export function AppShell() {
  const auth = useAuthStore((s) => s.auth);
  const tenantKey = useTenantStore((s) => s.tenantKey);

  if (auth.status !== "ready") return null; // RequireAuth already guarantees this

  const { context, modules, user } = auth;

  return (
    <div className="min-h-screen bg-parchment-50">
      <header className="border-b border-ink-900/10 bg-parchment-100/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <span className="font-display text-lg text-ink-900">Matrix</span>
            {tenantKey && (
              <span className="rounded-full bg-ink-900/5 px-2 py-0.5 text-xs font-medium text-ink-700/60">
                {tenantKey}
              </span>
            )}
            <nav className="flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-ink-900 text-parchment-50" : "text-ink-700 hover:bg-ink-900/5"
                  }`
                }
              >
                Dashboard
              </NavLink>
              {modules.sales && <NavDropdown label="Sales" items={salesItems} />}
              {modules.purchases && <NavDropdown label="Purchases" items={purchaseItems} />}
              {modules.inventory && (
                <NavLink
                  to="/items"
                  className={({ isActive }) =>
                    `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive ? "bg-ink-900 text-parchment-50" : "text-ink-700 hover:bg-ink-900/5"
                    }`
                  }
                >
                  Items
                </NavLink>
              )}
              {modules.finance && <NavDropdown label="Finance" items={financeItems} />}
              {(modules.administration || modules.inventory) && <SettingsMenu modules={modules} />}
            </nav>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <p className="font-medium text-ink-900">{context.companyName}</p>
              <p className="text-ink-700/60">{context.locationName}</p>
            </div>
            <div className="h-8 w-px bg-ink-900/10" />
            <div className="text-right">
              <p className="font-medium text-ink-900">{user.userName}</p>
              <p className="text-ink-700/60">{user.groupName}</p>
            </div>
            <SignOutControls />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function SignOutControls() {
  const logout = useLogout();
  const logoutAll = useLogoutAll();
  const [confirmingAll, setConfirmingAll] = useState(false);

  function handleSignOutAllClick() {
    if (!confirmingAll) {
      setConfirmingAll(true);
      return;
    }
    logoutAll.mutate();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="secondary" onClick={() => logout.mutate()} loading={logout.isPending}>
        Sign out
      </Button>
      <button
        type="button"
        onClick={handleSignOutAllClick}
        onBlur={() => setConfirmingAll(false)}
        disabled={logoutAll.isPending}
        className={`text-xs font-medium underline-offset-2 hover:underline ${
          confirmingAll ? "text-[#b3432f]" : "text-ink-700/50 hover:text-ink-900"
        }`}
      >
        {logoutAll.isPending
          ? "Signing out everywhere…"
          : confirmingAll
            ? "Confirm sign out on all devices?"
            : "Sign out everywhere"}
      </button>
    </div>
  );
}

function NavDropdown({ label, items }: { label: string; items: { to: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    // tabIndex + onBlur lets the dropdown close on outside click/tab-away
    // without a global click listener; the small timeout lets a click on a
    // menu item register before the blur closes the panel.
    <div className="relative" tabIndex={-1} onBlur={() => setTimeout(() => setOpen(false), 150)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-900/5"
      >
        {label} ▾
      </button>
      {open && (
        <div className="absolute left-0 z-10 mt-1 w-48 rounded-md border border-ink-900/10 bg-white py-1 shadow-lg">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block px-3 py-1.5 text-sm text-ink-700 hover:bg-parchment-100"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsMenu({ modules }: { modules: ModuleAccessInfo }) {
  const [open, setOpen] = useState(false);
  const visibleItems = settingsItems.filter((item) => modules[item.module]);
  const sections = [...new Set(visibleItems.map((item) => item.section))];

  return (
    <div className="relative" tabIndex={-1} onBlur={() => setTimeout(() => setOpen(false), 150)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-900/5"
      >
        Settings ▾
      </button>
      {open && (
        <div className="absolute left-0 z-10 mt-1 w-52 rounded-md border border-ink-900/10 bg-white py-1 shadow-lg">
          {sections.map((section) => (
            <div key={section}>
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-700/40">
                {section}
              </p>
              {visibleItems
                .filter((item) => item.section === section)
                .map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block px-3 py-1.5 text-sm text-ink-700 hover:bg-parchment-100"
                  >
                    {item.label}
                  </Link>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
