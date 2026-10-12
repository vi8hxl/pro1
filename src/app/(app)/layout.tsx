import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { SetupNotice } from "@/components/shared/setup-notice";
import { getProfile } from "@/lib/services/profiles";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

async function AppShellLoader({ children }: { children: React.ReactNode }) {
  // Mark this subtree as per-request (Cache Components).
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  if (!profile?.onboarded || !profile.role) redirect("/onboarding");

  return (
    <AppShell role={profile.role} name={profile.full_name}>
      {children}
    </AppShell>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseEnv()) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4 py-10">
        <SetupNotice />
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <AppShellLoader>{children}</AppShellLoader>
    </Suspense>
  );
}
