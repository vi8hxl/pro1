import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { OwnerSettingsForm } from "@/components/owner/owner-settings-form";
import { LoadingSkeleton } from "@/components/shared/loading";
import { PageHeading } from "@/components/shared/page-heading";
import { SectionCard } from "@/components/shared/section-card";
import { getProfile } from "@/lib/services/profiles";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Settings" };

async function SettingsData() {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);

  return (
    <SectionCard titleKey="settings.title">
      <OwnerSettingsForm
        currency={profile?.currency ?? "INR"}
        gracePeriodDays={profile?.grace_period_days ?? 3}
      />
    </SectionCard>
  );
}

export default function OwnerSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeading titleKey="settings.heading" subtitleKey="settings.subtitle" />
      <Suspense fallback={<LoadingSkeleton rows={3} />}>
        <SettingsData />
      </Suspense>
    </div>
  );
}
