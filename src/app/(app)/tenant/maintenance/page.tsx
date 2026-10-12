import { Suspense } from "react";
import { connection } from "next/server";
import { MaintenanceForm } from "@/components/tenant/maintenance-form";
import { MaintenanceHistory } from "@/components/tenant/maintenance-history";
import { UnlinkedTenantNotice } from "@/components/tenant/unlinked-notice";
import { LoadingSkeleton } from "@/components/shared/loading";
import { PageHeading } from "@/components/shared/page-heading";
import { requireTenant } from "@/lib/auth/require";
import { listMaintenanceRequests } from "@/lib/services/maintenance";
import { getTenantHome } from "@/lib/services/tenancies";

export const metadata = { title: "Maintenance" };

async function MaintenanceData() {
  await connection();
  const { supabase } = await requireTenant();

  const home = await getTenantHome(supabase);
  if (!home) return <UnlinkedTenantNotice />;

  const requests = await listMaintenanceRequests(supabase);

  return (
    <div className="space-y-6">
      <MaintenanceForm tenancyId={home.tenancy_id} />
      <MaintenanceHistory requests={requests} />
    </div>
  );
}

export default function TenantMaintenancePage() {
  return (
    <div className="space-y-6">
      <PageHeading titleKey="maintenance.heading" subtitleKey="maintenance.tenantSubtitle" />
      <Suspense fallback={<LoadingSkeleton rows={3} />}>
        <MaintenanceData />
      </Suspense>
    </div>
  );
}
