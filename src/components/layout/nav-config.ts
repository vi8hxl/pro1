import {
  BellIcon,
  Building2Icon,
  CreditCardIcon,
  FileTextIcon,
  HomeIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  ReceiptIcon,
  SettingsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types/database";

export interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

export const OWNER_NAV: NavItem[] = [
  { href: "/owner", labelKey: "nav.dashboard", icon: LayoutDashboardIcon },
  { href: "/owner/buildings", labelKey: "nav.buildings", icon: Building2Icon },
  { href: "/owner/tenants", labelKey: "nav.tenants", icon: UsersIcon },
  { href: "/owner/payments", labelKey: "nav.payments", icon: CreditCardIcon },
  { href: "/owner/maintenance", labelKey: "nav.maintenance", icon: LifeBuoyIcon },
  { href: "/owner/reports", labelKey: "nav.reports", icon: FileTextIcon },
  { href: "/owner/settings", labelKey: "nav.settings", icon: SettingsIcon },
];

export const TENANT_NAV: NavItem[] = [
  { href: "/tenant", labelKey: "nav.myRent", icon: HomeIcon },
  { href: "/tenant/payments", labelKey: "nav.history", icon: ReceiptIcon },
  { href: "/tenant/maintenance", labelKey: "nav.maintenance", icon: LifeBuoyIcon },
  { href: "/tenant/notifications", labelKey: "nav.notifications", icon: BellIcon },
];

export function navForRole(role: UserRole): NavItem[] {
  return role === "tenant" ? TENANT_NAV : OWNER_NAV;
}

export function homeForRole(role: UserRole | null | undefined): string {
  return role === "tenant" ? "/tenant" : "/owner";
}
