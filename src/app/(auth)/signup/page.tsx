import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { SetupNotice } from "@/components/shared/setup-notice";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div className="flex w-full justify-center">
        <SetupNotice />
      </div>
    );
  }

  return (
    <AuthCard titleKey="auth.signupTitle" subtitleKey="auth.signupSubtitle">
      <SignupForm />
    </AuthCard>
  );
}
