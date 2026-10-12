"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  completeOnboarding as completeOnboardingRecord,
  getProfileGate,
  updateProfile as updateProfileRecord,
} from "@/lib/services/profiles";
import { acceptInvite } from "@/lib/services/tenancies";
import {
  completeProfileSchema,
  emailLoginSchema,
  emailSignupSchema,
  updateProfileSchema,
} from "@/lib/validations/auth";
import { roleSchema } from "@/lib/validations/common";
import { PHONE_AUTH_ENABLED } from "./constants";

export interface AuthFormState {
  error?: string;
  success?: string;
}

function firstIssue(issues: Array<{ message?: string }>): string {
  return issues[0]?.message ?? "Please check the form and try again";
}

function homeFor(role: string | null | undefined): string {
  return role === "tenant" ? "/tenant" : "/owner";
}

const signupSchema = emailSignupSchema.extend({ role: roleSchema });

/** Create an email/password account, set the chosen role, then land on the dashboard. */
export async function signUpWithEmail(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    role: formData.get("role"),
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { error: firstIssue(parsed.error.issues) };
  const { role, full_name, email, password } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, role } },
  });

  if (error) return { error: error.message };

  // Email confirmation is on: no session yet.
  if (!data.session || !data.user) {
    return {
      success: "Account created. Check your email to confirm, then log in.",
    };
  }

  try {
    await completeOnboardingRecord(supabase, data.user.id, {
      role,
      full_name,
      locale: "en",
    });
  } catch (cause) {
    return {
      error:
        cause instanceof Error
          ? cause.message
          : "Could not set up your profile. Please try again.",
    };
  }

  redirect(homeFor(role));
}

export async function signInWithEmail(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = emailLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { error: firstIssue(parsed.error.issues) };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { error: error.message };
  if (!data.user) return { error: "Could not sign you in. Please try again." };

  const gate = await getProfileGate(supabase, data.user.id);
  redirect(gate?.onboarded ? homeFor(gate.role) : "/onboarding");
}

/** Phone OTP — stays disabled until a Twilio sender exists in Supabase. */
export async function sendPhoneOtp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!PHONE_AUTH_ENABLED) {
    return { error: "Phone sign-in is not enabled yet." };
  }

  const phone = String(formData.get("phone") ?? "").trim();
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) return { error: error.message };
  return { success: "We sent you a 6-digit code." };
}

export async function verifyPhoneOtp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!PHONE_AUTH_ENABLED) {
    return { error: "Phone sign-in is not enabled yet." };
  }

  const phone = String(formData.get("phone") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });

  if (error) return { error: error.message };

  const gate = data.user ? await getProfileGate(supabase, data.user.id) : null;
  redirect(gate?.onboarded ? homeFor(gate.role) : "/onboarding");
}

/** Finish signup for users who reach the app without a role yet. */
export async function completeOnboarding(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = completeProfileSchema.safeParse({
    role: formData.get("role"),
    full_name: formData.get("full_name"),
    locale: formData.get("locale") ?? "en",
  });

  if (!parsed.success) return { error: firstIssue(parsed.error.issues) };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  try {
    await completeOnboardingRecord(supabase, user.id, parsed.data);
  } catch (cause) {
    return {
      error:
        cause instanceof Error ? cause.message : "Could not save your details",
    };
  }

  redirect(homeFor(parsed.data.role));
}

export async function updateAccount(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = updateProfileSchema.safeParse({
    full_name: formData.get("full_name") || undefined,
    locale: formData.get("locale") || undefined,
    currency: formData.get("currency") || undefined,
    grace_period_days:
      formData.get("grace_period_days") === null
        ? undefined
        : Number(formData.get("grace_period_days")),
  });

  if (!parsed.success) return { error: firstIssue(parsed.error.issues) };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  try {
    await updateProfileRecord(supabase, user.id, parsed.data);
  } catch (cause) {
    return {
      error: cause instanceof Error ? cause.message : "Could not save changes",
    };
  }

  revalidatePath("/account");
  return { success: "Saved." };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function acceptInviteAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) return { error: "This invite link is incomplete." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/invite/${token}`);

  try {
    await acceptInvite(supabase, token);
  } catch (cause) {
    return {
      error:
        cause instanceof Error
          ? cause.message
          : "We could not accept this invite.",
    };
  }

  revalidatePath("/tenant");
  redirect("/tenant");
}
