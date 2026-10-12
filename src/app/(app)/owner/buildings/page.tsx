import { Suspense } from "react";
import { connection } from "next/server";
import { BuildingsManager } from "@/components/owner/buildings-manager";
import { LoadingSkeleton } from "@/components/shared/loading";
import { PageHeading } from "@/components/shared/page-heading";
import { listApartments } from "@/lib/services/apartments";
import { listBuildings } from "@/lib/services/buildings";
import { requireOwner } from "@/lib/auth/require";

export const metadata = { title: "Buildings" };

async function BuildingsData() {
  await connection();
  const { supabase } = await requireOwner();

  const [buildings, apartments] = await Promise.all([
    listBuildings(supabase),
    listApartments(supabase),
  ]);

  return <BuildingsManager buildings={buildings} apartments={apartments} />;
}

export default function BuildingsPage() {
  return (
    <div className="space-y-6">
      <PageHeading titleKey="buildings.heading" subtitleKey="buildings.subtitle" />
      <Suspense fallback={<LoadingSkeleton rows={4} />}>
        <BuildingsData />
      </Suspense>
    </div>
  );
}
