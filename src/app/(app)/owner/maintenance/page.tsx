import { Suspense } from "react";
import { connection } from "next/server";
import { MaintenanceList } from "@/components/owner/maintenance-list";
import { LoadingSkeleton } from "@/components/shared/loading";
import { PageHeading } from "@/components/shared/page-heading";
import { requireOwner } from "@/lib/auth/require";
import { listMaintenanceRequests } from "@/lib/services/maintenance";

export const metadata = { title: "Maintenance" };

async function MaintenanceData() {
  await connection();
  const { supabase } = await requireOwner();
  const requests = await listMaintenanceRequests(supabase);
  return <MaintenanceList requests={requests} />;
}

export default function OwnerMaintenancePage() {
  return (
    <div className="space-y-6">
      <PageHeading titleKey="maintenance.heading" subtitleKey="maintenance.ownerSubtitle" />
      <Suspense fallback={<LoadingSkeleton rows={3} />}>
        <MaintenanceData />
      </Suspense>
    </div>
  );
}
