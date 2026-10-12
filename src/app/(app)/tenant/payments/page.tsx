import { Suspense } from "react";
import { connection } from "next/server";
import { PaymentList } from "@/components/tenant/payment-list";
import { UnlinkedTenantNotice } from "@/components/tenant/unlinked-notice";
import { LoadingSkeleton } from "@/components/shared/loading";
import { PageHeading } from "@/components/shared/page-heading";
import { SectionCard } from "@/components/shared/section-card";
import { requireTenant } from "@/lib/auth/require";
import { listPaymentsByTenancy } from "@/lib/services/payments";
import { getTenantHome } from "@/lib/services/tenancies";

export const metadata = { title: "Payment history" };

async function HistoryData() {
  await connection();
  const { supabase } = await requireTenant();

  const home = await getTenantHome(supabase);
  if (!home) return <UnlinkedTenantNotice />;

  const payments = await listPaymentsByTenancy(supabase, home.tenancy_id);
  return <PaymentList payments={payments} />;
}

export default function TenantPaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeading titleKey="tenant.history" subtitleKey="tenant.historySubtitle" />
      <SectionCard titleKey="tenant.history" contentClassName="px-0">
        <Suspense fallback={<LoadingSkeleton rows={4} />}>
          <HistoryData />
        </Suspense>
      </SectionCard>
    </div>
  );
}
