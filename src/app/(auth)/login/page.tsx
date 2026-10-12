import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { SetupNotice } from "@/components/shared/setup-notice";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div className="flex w-full justify-center">
        <SetupNotice />
      </div>
    );
  }

  return (
    <AuthCard titleKey="auth.loginTitle" subtitleKey="auth.loginSubtitle">
      <LoginForm />
    </AuthCard>
  );
}
