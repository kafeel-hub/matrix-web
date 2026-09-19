import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "@/auth/auth-store";
import { useLogout, useLogoutAll } from "@/auth/use-auth";
import { useTenantStore } from "@/tenant/tenant-store";
import { Button } from "@/shared/components/Button";
import {
  DashboardIcon,
  SalesIcon,
  PurchaseIcon,
  ItemsIcon,
  FinanceIcon,
  SettingsIcon,
  ChevronDownIcon,
  ChevronsLeftIcon,
  MenuIcon,
} from "@/shared/components/icons";
import type { ModuleAccessInfo } from "@/types/auth";

// Reskinned to a TailAdmin-style collapsible sidebar layout (see README's
// reskin notes) — same nav data/module gating as before, just restructured
// from top-nav dropdowns into sidebar accordion groups.

interface NavItem {
  to: string;
  label: string;
}
interface NavGroup {
  key: string;
  label: string;
  icon: (props: { className?: string }) => JSX.Element;
  module: keyof ModuleAccessInfo;
  to?: string; // single link, no sub-items
  items?: NavItem[];
}

const salesItems: NavItem[] = [
  { to: "/sales/new", label: "New sale" },
  { to: "/sales/returns/new", label: "Sales return" },
  { to: "/sales/unfixed/new", label: "Unfixed sale" },
  { to: "/sales/gold-fixing/new", label: "Gold fixing voucher" },
  { to: "/customers", label: "Customers" },
];
const purchaseItems: NavItem[] = [
  { to: "/suppliers", label: "Suppliers" },
  { to: "/purchases/scrap/new", label: "Scrap purchase" },
  { to: "/purchases/unfixed/new", label: "Unfixed purchase" },
  { to: "/purchases/gold-fixing/new", label: "Gold fixing voucher" },
];
const financeItems: NavItem[] = [
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

const navGroups: NavGroup[] = [
  { key: "sales", label: "Sales", icon: SalesIcon, module: "sales", items: salesItems },
  { key: "purchases", label: "Purchases", icon: PurchaseIcon, module: "purchases", items: purchaseItems },
  { key: "items", label: "Items", icon: ItemsIcon, module: "inventory", to: "/items" },
  { key: "finance", label: "Finance", icon: FinanceIcon, module: "finance", items: financeItems },
];

export function AppShell() {
  const auth = useAuthStore((s) => s.auth);
  const tenantKey = useTenantStore((s) => s.tenantKey);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (auth.status !== "ready") return null; // RequireAuth already guarantees this

  const { context, modules, user } = auth;

  return (
    <div className="flex h-screen overflow-hidden bg-parchment-100">
      <Sidebar
        modules={modules}
        tenantKey={tenantKey}
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <header className="sticky top-0 z-30 border-b border-ink-900/10 bg-white">
          <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-md p-1.5 text-ink-700 hover:bg-ink-900/5 lg:hidden"
                aria-label="Open menu"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                className="hidden rounded-md p-1.5 text-ink-700 hover:bg-ink-900/5 lg:block"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <ChevronsLeftIcon className={`h-5 w-5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="hidden text-right sm:block">
                <p className="font-medium text-ink-900">{context.companyName}</p>
                <p className="text-ink-700/60">{context.locationName}</p>
              </div>
              <div className="hidden h-8 w-px bg-ink-900/10 sm:block" />
              <div className="hidden text-right md:block">
                <p className="font-medium text-ink-900">{user.userName}</p>
                <p className="text-ink-700/60">{user.groupName}</p>
              </div>
              <SignOutControls />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  modules,
  tenantKey,
  mobileOpen,
  collapsed,
  onCloseMobile,
}: {
  modules: ModuleAccessInfo;
  tenantKey: string | null;
  mobileOpen: boolean;
  collapsed: boolean;
  onCloseMobile: () => void;
}) {
  const visibleGroups = navGroups.filter((g) => modules[g.module]);
  const showSettings = modules.administration || modules.inventory;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/50 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-ink-900/10 bg-white transition-all duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-20" : "lg:w-64"} w-64`}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 px-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brass-500 font-display text-sm font-bold text-white">
            M
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold text-ink-900">Matrix</p>
              {tenantKey && <p className="truncate text-xs text-ink-700/40">{tenantKey}</p>}
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {!collapsed && (
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-ink-700/35">Menu</p>
          )}
          <SidebarLink to="/" label="Dashboard" icon={DashboardIcon} end collapsed={collapsed} />

          {visibleGroups.map((group) =>
            group.to ? (
              <SidebarLink key={group.key} to={group.to} label={group.label} icon={group.icon} collapsed={collapsed} />
            ) : (
              <SidebarGroup key={group.key} group={group} collapsed={collapsed} />
            ),
          )}

          {showSettings && (
            <SidebarSettingsGroup modules={modules} collapsed={collapsed} />
          )}
        </nav>
      </aside>
    </>
  );
}

function SidebarLink({
  to,
  label,
  icon: IconComponent,
  end,
  collapsed,
}: {
  to: string;
  label: string;
  icon: (props: { className?: string }) => JSX.Element;
  end?: boolean;
  collapsed: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `mb-0.5 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive ? "bg-brand-50 text-brand-600" : "text-ink-700 hover:bg-ink-900/5"
        } ${collapsed ? "justify-center" : ""}`
      }
    >
      <IconComponent className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

function SidebarGroup({ group, collapsed }: { group: NavGroup; collapsed: boolean }) {
  const [open, setOpen] = useState(false);
  const IconComponent = group.icon;

  if (collapsed) {
    // Collapsed rail: clicking a group jumps straight to its first item
    // rather than building a hover-flyout — the person can expand the
    // sidebar again (header toggle) for the full group.
    return (
      <NavLink
        to={group.items?.[0]?.to ?? "#"}
        title={group.label}
        className={({ isActive }) =>
          `mb-0.5 flex items-center justify-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive ? "bg-brand-50 text-brand-600" : "text-ink-700 hover:bg-ink-900/5"
          }`
        }
      >
        <IconComponent className="h-5 w-5 shrink-0" />
      </NavLink>
    );
  }

  return (
    <div className="mb-0.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-900/5"
      >
        <IconComponent className="h-5 w-5 shrink-0" />
        <span className="flex-1 truncate text-left">{group.label}</span>
        <ChevronDownIcon className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-ink-900/10 pl-4">
          {group.items?.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? "font-medium text-brand-600" : "text-ink-700/70 hover:text-ink-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarSettingsGroup({ modules, collapsed }: { modules: ModuleAccessInfo; collapsed: boolean }) {
  const [open, setOpen] = useState(false);
  const visibleItems = settingsItems.filter((item) => modules[item.module]);
  const sections = [...new Set(visibleItems.map((item) => item.section))];

  if (collapsed) {
    return (
      <NavLink
        to={visibleItems[0]?.to ?? "#"}
        title="Settings"
        className={({ isActive }) =>
          `mb-0.5 flex items-center justify-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive ? "bg-brand-50 text-brand-600" : "text-ink-700 hover:bg-ink-900/5"
          }`
        }
      >
        <SettingsIcon className="h-5 w-5 shrink-0" />
      </NavLink>
    );
  }

  return (
    <div className="mb-0.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-900/5"
      >
        <SettingsIcon className="h-5 w-5 shrink-0" />
        <span className="flex-1 truncate text-left">Settings</span>
        <ChevronDownIcon className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="ml-4 mt-0.5 flex flex-col gap-2 border-l border-ink-900/10 pl-4">
          {sections.map((section) => (
            <div key={section}>
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-700/35">
                {section}
              </p>
              <div className="flex flex-col gap-0.5">
                {visibleItems
                  .filter((item) => item.section === section)
                  .map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `rounded-md px-3 py-2 text-sm transition-colors ${
                          isActive ? "font-medium text-brand-600" : "text-ink-700/70 hover:text-ink-900"
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
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
          confirmingAll ? "text-[#d92d20]" : "text-ink-700/50 hover:text-ink-900"
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
