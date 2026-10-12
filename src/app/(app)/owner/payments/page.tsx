import { Suspense } from "react";
import { connection } from "next/server";
import { PaymentTable } from "@/components/owner/payment-table";
import { RecordPaymentForm } from "@/components/owner/record-payment-form";
import { LoadingSkeleton } from "@/components/shared/loading";
import { PageHeading } from "@/components/shared/page-heading";
import { SectionCard } from "@/components/shared/section-card";
import { requireOwner } from "@/lib/auth/require";
import { toISODate } from "@/lib/dates";
import { listOwnerPayments } from "@/lib/services/payments";
import { listTenancies } from "@/lib/services/tenancies";

export const metadata = { title: "Payments" };

async function PaymentsData() {
  await connection();
  const { supabase } = await requireOwner();

  const [payments, tenancies] = await Promise.all([
    listOwnerPayments(supabase, { limit: 100 }),
    listTenancies(supabase),
  ]);

  const labels: Record<string, string> = {};
  for (const tenancy of tenancies) {
    labels[tenancy.id] = [tenancy.tenant_name, tenancy.apartment_label]
      .filter(Boolean)
      .join(" · ");
  }

  const options = tenancies
    .filter((tenancy) => tenancy.status === "active")
    .map((tenancy) => ({
      id: tenancy.id,
      label: [tenancy.tenant_name, tenancy.apartment_label].filter(Boolean).join(" · "),
      pending: tenancy.pending,
    }));

  const today = toISODate(new Date()) ?? "";

  return (
    <div className="space-y-6">
      <RecordPaymentForm tenancies={options} today={today} />
      <SectionCard titleKey="pay.history" contentClassName="px-0">
        <PaymentTable payments={payments} labels={labels} />
      </SectionCard>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeading titleKey="pay.heading" subtitleKey="pay.subtitle" />
      <Suspense fallback={<LoadingSkeleton rows={4} />}>
        <PaymentsData />
      </Suspense>
    </div>
  );
}
