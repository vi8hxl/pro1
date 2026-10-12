import type { SupabaseClient } from "@supabase/supabase-js";
import type { CompleteProfileInput } from "@/lib/validations/auth";
import type { Database, Tables, UserRole } from "@/types/database";
import { type DbClient, unwrap, unwrapMaybe } from "./client";

export type Profile = Tables<"profiles">;

type AnyClient = DbClient | SupabaseClient<Database>;

export async function getProfile(
  client: AnyClient,
  userId: string,
): Promise<Profile | null> {
  return unwrapMaybe(
    await (client as DbClient)
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle(),
  );
}

export interface ProfileGate {
  role: UserRole | null;
  onboarded: boolean;
}

/** Lightweight role/onboarded lookup used by the route guards. */
export async function getProfileGate(
  client: AnyClient,
  userId: string,
): Promise<ProfileGate | null> {
  const { data, error } = await (client as DbClient)
    .from("profiles")
    .select("role, onboarded")
    .eq("id", userId)
    .maybeSingle();

  if (error) return null;
  return data ?? null;
}

/** Finish signup: set the chosen role, name (and locale) and mark onboarded. */
export async function completeOnboarding(
  client: DbClient,
  userId: string,
  input: CompleteProfileInput,
): Promise<Profile> {
  // upsert so this also heals the rare case where the signup trigger row
  // is missing.
  return unwrap(
    await client
      .from("profiles")
      .upsert(
        {
          id: userId,
          role: input.role,
          full_name: input.full_name,
          locale: input.locale,
          onboarded: true,
        },
        { onConflict: "id" },
      )
      .select("*")
      .single(),
  );
}

export async function updateProfile(
  client: DbClient,
  userId: string,
  input: {
    full_name?: string;
    locale?: string;
    currency?: string;
    grace_period_days?: number;
  },
): Promise<Profile> {
  return unwrap(
    await client
      .from("profiles")
      .update({
        ...(input.full_name !== undefined ? { full_name: input.full_name } : {}),
        ...(input.locale !== undefined ? { locale: input.locale } : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(input.grace_period_days !== undefined
          ? { grace_period_days: input.grace_period_days }
          : {}),
      })
      .eq("id", userId)
      .select("*")
      .single(),
  );
}
