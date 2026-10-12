import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AccountForm } from "@/components/auth/account-form";
import { LoadingSkeleton } from "@/components/shared/loading";
import { PageHeading } from "@/components/shared/page-heading";
import { SectionCard } from "@/components/shared/section-card";
import { getProfile } from "@/lib/services/profiles";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Account" };

async function AccountData() {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);

  return (
    <SectionCard titleKey="account.title">
      <AccountForm
        fullName={profile?.full_name ?? null}
        locale={profile?.locale ?? "en"}
        role={profile?.role ?? "owner"}
      />
    </SectionCard>
  );
}

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeading titleKey="account.heading" subtitleKey="account.subtitle" />
      <Suspense fallback={<LoadingSkeleton rows={3} />}>
        <AccountData />
      </Suspense>
    </div>
  );
}
