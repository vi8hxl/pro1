import { Suspense } from "react";
import { connection } from "next/server";
import { AcceptInviteForm } from "@/components/tenant/accept-invite-form";
import { AuthCard } from "@/components/auth/auth-card";
import { LoadingSkeleton } from "@/components/shared/loading";
import { SetupNotice } from "@/components/shared/setup-notice";
import { hasSupabaseEnv } from "@/lib/supabase/env";

/**
 * The [token] param is read with useParams() inside AcceptInviteForm, which
 * requires a Suspense boundary to stream (Next.js 16 Cache Components).
 */
async function DynamicMarker() {
  await connection();
  return null;
}

export default function InvitePage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <Suspense
        fallback={<LoadingSkeleton rows={3} className="w-full max-w-md" />}
      >
        <DynamicMarker />
        {hasSupabaseEnv() ? (
          <AuthCard titleKey="invite.title" subtitleKey="invite.subtitle">
            <AcceptInviteForm />
          </AuthCard>
        ) : (
          <SetupNotice />
        )}
      </Suspense>
    </div>
  );
}
