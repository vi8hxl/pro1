import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, type Profile } from "@/lib/services/profiles";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  return { supabase, user };
}

export async function requireProfile(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  profile: Profile;
}> {
  const { supabase, user } = await requireUser();
  const profile = await getProfile(supabase, user.id);

  if (!profile?.onboarded || !profile.role) redirect("/onboarding");
  return { supabase, userId: user.id, profile };
}

export async function requireOwner() {
  const context = await requireProfile();
  if (context.profile.role !== "owner") redirect("/tenant");
  return context;
}

export async function requireTenant() {
  const context = await requireProfile();
  if (context.profile.role !== "tenant") redirect("/owner");
  return context;
}
