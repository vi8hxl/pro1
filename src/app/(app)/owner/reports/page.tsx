import { Suspense } from "react";
import { connection } from "next/server";
import { ReportTable } from "@/components/owner/report-table";
import { LoadingSkeleton } from "@/components/shared/loading";
import { PageHeading } from "@/components/shared/page-heading";
import { SectionCard } from "@/components/shared/section-card";
import { requireOwner } from "@/lib/auth/require";
import { getCollectedVsPending } from "@/lib/services/reports";

export const metadata = { title: "Reports" };

async function ReportsData() {
  await connection();
  const { supabase } = await requireOwner();
  const rows = await getCollectedVsPending(supabase, 12);
  return <ReportTable rows={rows} />;
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeading titleKey="reports.heading" subtitleKey="reports.subtitle" />
      <SectionCard titleKey="reports.title">
        <Suspense fallback={<LoadingSkeleton rows={6} />}>
          <ReportsData />
        </Suspense>
      </SectionCard>
    </div>
  );
}
