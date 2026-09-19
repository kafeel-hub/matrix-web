import type { SVGProps } from "react";

// Minimal, stroke-based, 24x24, currentColor — deliberately not pulling in
// an icon library dependency for what's a handful of nav icons.
function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

export function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="4.5" rx="1.5" />
      <rect x="13.5" y="10.5" width="7" height="10" rx="1.5" />
      <rect x="3.5" y="13" width="7" height="7.5" rx="1.5" />
    </Icon>
  );
}

export function SalesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3 4h2l1.2 11.4a1.8 1.8 0 0 0 1.8 1.6h8.6a1.8 1.8 0 0 0 1.78-1.53L20 8.5H6.2" />
      <circle cx="9" cy="20" r="1.3" />
      <circle cx="16" cy="20" r="1.3" />
    </Icon>
  );
}

export function PurchaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3.5 8 12 3.5 20.5 8v8L12 20.5 3.5 16Z" />
      <path d="M3.5 8 12 12.5 20.5 8" />
      <path d="M12 12.5V20.5" />
    </Icon>
  );
}

export function ItemsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="m12 2.5 3 4h-6l3-4Z" />
      <path d="M4 6.5h16l-1.6 13.2a1.5 1.5 0 0 1-1.49 1.3H7.09a1.5 1.5 0 0 1-1.49-1.3L4 6.5Z" />
    </Icon>
  );
}

export function FinanceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="2.5" y="6" width="19" height="13" rx="2" />
      <path d="M2.5 10.5h19" />
      <path d="M6 14.5h4" />
    </Icon>
  );
}

export function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H4.5a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10.5a1.7 1.7 0 0 0 1-1.55V4.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V10.5a1.7 1.7 0 0 0 1.55 1H19.5a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1Z" />
    </Icon>
  );
}

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3.5 6h17M3.5 12h17M3.5 18h17" />
    </Icon>
  );
}

export function ChevronsLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="m17 6-6 6 6 6" />
      <path d="m10 6-6 6 6 6" />
    </Icon>
  );
}

export function PercentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M19 5 5 19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </Icon>
  );
}

export function LogoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M15 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" />
      <path d="M20 12H9" />
      <path d="m16 8 4 4-4 4" />
    </Icon>
  );
}
