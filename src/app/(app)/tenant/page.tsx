import { Suspense } from "react";
import { connection } from "next/server";
import { PaymentList } from "@/components/tenant/payment-list";
import { RentSummary } from "@/components/tenant/rent-summary";
import { UnlinkedTenantNotice } from "@/components/tenant/unlinked-notice";
import { LoadingSkeleton } from "@/components/shared/loading";
import { PageHeading } from "@/components/shared/page-heading";
import { SectionCard } from "@/components/shared/section-card";
import { listPaymentsByTenancy } from "@/lib/services/payments";
import { getTenantHome } from "@/lib/services/tenancies";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "My rent" };

async function TenantData() {
  await connection();

  const supabase = await createClient();
  const home = await getTenantHome(supabase);

  if (!home) {
    return <UnlinkedTenantNotice />;
  }

  const payments = await listPaymentsByTenancy(supabase, home.tenancy_id);

  return (
    <div className="space-y-6">
      <RentSummary home={home} />
      <SectionCard titleKey="tenant.history" contentClassName="px-0">
        <PaymentList payments={payments} />
      </SectionCard>
    </div>
  );
}

export default function TenantHomePage() {
  return (
    <div className="space-y-6">
      <PageHeading titleKey="tenant.title" subtitleKey="tenant.subtitle" />
      <Suspense fallback={<LoadingSkeleton rows={4} />}>
        <TenantData />
      </Suspense>
    </div>
  );
}
