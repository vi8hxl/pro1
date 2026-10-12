import { Suspense } from "react";
import { connection } from "next/server";
import { AuthCard } from "@/components/auth/auth-card";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { LoadingSkeleton } from "@/components/shared/loading";
import { getProfile } from "@/lib/services/profiles";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Set up your account" };

async function OnboardingContent() {
  // Per-request data (Cache Components).
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await getProfile(supabase, user.id) : null;

  return (
    <AuthCard titleKey="auth.onboardingTitle" subtitleKey="auth.onboardingSubtitle">
      <OnboardingForm defaultName={profile?.full_name} />
    </AuthCard>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={<LoadingSkeleton rows={3} className="w-full max-w-md" />}
    >
      <OnboardingContent />
    </Suspense>
  );
}
