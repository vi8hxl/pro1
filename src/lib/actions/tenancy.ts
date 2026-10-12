"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require";
import {
  changeRent,
  createTenancy,
  markMovedOut,
  regenerateInvite,
} from "@/lib/services/tenancies";
import { changeRentSchema, createTenancySchema, moveOutSchema } from "@/lib/validations/tenancy";
import type { AuthFormState } from "@/lib/auth/actions";

function firstIssue(issues: Array<{ message?: string }>): string {
  return issues[0]?.message ?? "Please check the form and try again";
}

export interface InviteState extends AuthFormState {
  inviteToken?: string;
}

export async function createTenancyAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const parsed = createTenancySchema.safeParse({
    apartment_id: formData.get("apartment_id"),
    tenant_name: formData.get("tenant_name"),
    tenant_phone: formData.get("tenant_phone") ?? "",
    tenant_email: formData.get("tenant_email") ?? "",
    move_in_date: formData.get("move_in_date"),
    rent_amount: formData.get("rent_amount"),
    due_day: formData.get("due_day") || 1,
    deposit_amount: formData.get("deposit_amount") || 0,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error.issues) };

  const { supabase, userId } = await requireOwner();

  try {
    const tenancy = await createTenancy(supabase, userId, parsed.data);
    revalidatePath("/owner/tenants");
    revalidatePath("/owner");
    return { success: `${parsed.data.tenant_name} added.`, inviteToken: tenancy.invite_token ?? undefined };
  } catch (cause) {
    return { error: cause instanceof Error ? cause.message : "Could not add tenant" };
  }
}

export async function regenerateInviteAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { supabase } = await requireOwner();
  await regenerateInvite(supabase, id);
  revalidatePath("/owner/tenants");
}

export async function changeRentAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = changeRentSchema.safeParse({
    tenancy_id: formData.get("tenancy_id"),
    rent_amount: formData.get("rent_amount"),
    effective_from: formData.get("effective_from"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error.issues) };

  const { supabase } = await requireOwner();

  try {
    await changeRent(supabase, parsed.data);
  } catch (cause) {
    return { error: cause instanceof Error ? cause.message : "Could not change rent" };
  }

  revalidatePath("/owner/tenants");
  return { success: "Rent updated." };
}

export async function markMovedOutAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = moveOutSchema.safeParse({
    tenancy_id: formData.get("tenancy_id"),
    move_out_date: formData.get("move_out_date"),
    deposit_settled: formData.get("deposit_settled") || undefined,
  });
  if (!parsed.success) return { error: firstIssue(parsed.error.issues) };

  const { supabase } = await requireOwner();

  try {
    await markMovedOut(supabase, parsed.data);
  } catch (cause) {
    return { error: cause instanceof Error ? cause.message : "Could not move out" };
  }

  revalidatePath("/owner/tenants");
  revalidatePath("/owner");
  return { success: "Tenant marked as moved out." };
}
