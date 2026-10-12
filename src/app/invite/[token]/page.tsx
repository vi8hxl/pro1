import { Suspense } from "react";
import { connection } from "next/server";
import { AcceptInviteForm } from "@/components/tenant/accept-invite-form";
import { AuthCard } from "@/components/auth/auth-card";
import { SetupNotice } from "@/components/shared/setup-notice";
import { hasSupabaseEnv } from "@/lib/supabase/env";

/**
 * Marks this dynamic route as streaming so its metadata boundary does not
 * block prerendering (Next.js 16 Cache Components). The [token] param itself
 * is read on the client inside AcceptInviteForm.
 */
async function DynamicMarker() {
  await connection();
  return null;
}

export default function InvitePage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <Suspense fallback={null}>
        <DynamicMarker />
      </Suspense>
      {hasSupabaseEnv() ? (
        <AuthCard titleKey="invite.title" subtitleKey="invite.subtitle">
          <AcceptInviteForm />
        </AuthCard>
      ) : (
        <SetupNotice />
      )}
    </div>
  );
}
