import { Suspense } from "react";
import { connection } from "next/server";
import { MonthlyChart } from "@/components/charts/monthly-chart";
import { DashboardStats } from "@/components/owner/dashboard-stats";
import { TenantTable } from "@/components/owner/tenant-table";
import { PageHeading } from "@/components/shared/page-heading";
import { LoadingSkeleton, StatCardSkeleton } from "@/components/shared/loading";
import { SectionCard } from "@/components/shared/section-card";
import { getOwnerDashboard, getOwnerMonthly } from "@/lib/services/dashboard";
import { listTenancies } from "@/lib/services/tenancies";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard" };

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      <LoadingSkeleton rows={3} />
    </div>
  );
}

async function DashboardData() {
  // Per-request data (Cache Components).
  await connection();

  const supabase = await createClient();
  const [stats, monthly, tenancies] = await Promise.all([
    getOwnerDashboard(supabase),
    getOwnerMonthly(supabase, 6),
    listTenancies(supabase, { status: "active" }),
  ]);

  const chartData = monthly.map((point) => ({
    month: new Intl.DateTimeFormat("en-IN", { month: "short" }).format(
      new Date(point.period_month),
    ),
    expected: point.expected,
    collected: point.collected,
  }));

  return (
    <div className="space-y-6">
      <DashboardStats stats={stats} />

      <SectionCard titleKey="dash.collectedVsPending">
        <MonthlyChart data={chartData} />
      </SectionCard>

      <SectionCard titleKey="dash.tenantsTitle" contentClassName="px-0">
        <TenantTable tenancies={tenancies} />
      </SectionCard>
    </div>
  );
}

export default function OwnerDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeading titleKey="dash.title" subtitleKey="dash.subtitle" />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardData />
      </Suspense>
    </div>
  );
}
