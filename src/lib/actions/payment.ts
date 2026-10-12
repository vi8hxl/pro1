"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require";
import { deletePayment, recordPayment } from "@/lib/services/payments";
import { recordPaymentSchema } from "@/lib/validations/payment";
import type { AuthFormState } from "@/lib/auth/actions";

function firstIssue(issues: Array<{ message?: string }>): string {
  return issues[0]?.message ?? "Please check the form and try again";
}

export async function recordPaymentAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = recordPaymentSchema.safeParse({
    tenancy_id: formData.get("tenancy_id"),
    amount: formData.get("amount"),
    paid_on: formData.get("paid_on"),
    mode: formData.get("mode") || "cash",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error.issues) };

  const { supabase, userId } = await requireOwner();

  try {
    await recordPayment(supabase, userId, userId, parsed.data);
  } catch (cause) {
    return { error: cause instanceof Error ? cause.message : "Could not record payment" };
  }

  revalidatePath("/owner/payments");
  revalidatePath("/owner");
  revalidatePath("/tenant");
  return { success: "Payment recorded." };
}

export async function deletePaymentAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { supabase } = await requireOwner();
  await deletePayment(supabase, id);
  revalidatePath("/owner/payments");
  revalidatePath("/owner");
}
