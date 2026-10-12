import { Suspense } from "react";
import { connection } from "next/server";
import { AcceptInviteForm } from "@/components/tenant/accept-invite-form";
import { AuthCard } from "@/components/auth/auth-card";
import { LoadingSkeleton } from "@/components/shared/loading";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Accept invite" };

async function InviteContent({ params }: { params: Promise<{ token: string }> }) {
  await connection();

  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AuthCard titleKey="invite.title" subtitleKey="invite.subtitle">
      <AcceptInviteForm token={token} signedIn={Boolean(user)} />
    </AuthCard>
  );
}

export default function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <Suspense fallback={<LoadingSkeleton rows={3} className="w-full max-w-md" />}>
        <InviteContent params={params} />
      </Suspense>
    </div>
  );
}
