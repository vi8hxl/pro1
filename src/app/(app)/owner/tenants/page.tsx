import { Suspense } from "react";
import { connection } from "next/server";
import { AddTenantForm } from "@/components/owner/add-tenant-form";
import { TenantTable } from "@/components/owner/tenant-table";
import { LoadingSkeleton } from "@/components/shared/loading";
import { PageHeading } from "@/components/shared/page-heading";
import { SectionCard } from "@/components/shared/section-card";
import { requireOwner } from "@/lib/auth/require";
import { toISODate } from "@/lib/dates";
import { listApartments } from "@/lib/services/apartments";
import { listTenancies } from "@/lib/services/tenancies";

export const metadata = { title: "Tenants" };

async function TenantsData() {
  await connection();
  const { supabase } = await requireOwner();

  const [tenancies, apartments] = await Promise.all([
    listTenancies(supabase),
    listApartments(supabase),
  ]);

  const available = apartments.filter((a) => a.status === "vacant");
  const today = toISODate(new Date()) ?? "";

  return (
    <div className="space-y-6">
      <AddTenantForm apartments={available} today={today} />
      <SectionCard titleKey="tenants.list" contentClassName="px-0">
        <TenantTable tenancies={tenancies} />
      </SectionCard>
    </div>
  );
}

export default function TenantsPage() {
  return (
    <div className="space-y-6">
      <PageHeading titleKey="tenants.heading" subtitleKey="tenants.subtitle" />
      <Suspense fallback={<LoadingSkeleton rows={4} />}>
        <TenantsData />
      </Suspense>
    </div>
  );
}
