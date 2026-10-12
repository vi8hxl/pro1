"use client";

import {
  AlertTriangleIcon,
  Building2Icon,
  TrendingUpIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Money } from "@/components/shared/money";
import { useT } from "@/lib/i18n/provider";
import type { OwnerDashboard } from "@/lib/services/dashboard";

export function DashboardStats({ stats }: { stats: OwnerDashboard }) {
  const t = useT();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label={t("dash.expected")}
        value={<Money value={stats.expected_this_month} />}
        hint={t("dash.thisMonth")}
        icon={WalletIcon}
      />
      <StatCard
        label={t("dash.collected")}
        value={<Money value={stats.collected_this_month} />}
        hint={t("dash.thisMonth")}
        tone="success"
        icon={TrendingUpIcon}
      />
      <StatCard
        label={t("dash.pending")}
        value={<Money value={stats.total_pending} />}
        hint={t("dash.allTime")}
        tone={stats.total_pending > 0 ? "danger" : "success"}
        icon={AlertTriangleIcon}
      />
      <StatCard
        label={t("dash.tenants")}
        value={stats.tenant_count}
        hint={`${stats.vacant_count} ${t("dash.vacant")}`}
        icon={UsersIcon}
      />
      <StatCard
        label={t("dash.vacant")}
        value={stats.vacant_count}
        icon={Building2Icon}
        className="sm:col-span-2 lg:col-span-1"
      />
    </div>
  );
}
