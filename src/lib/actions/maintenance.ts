"use server";

import { revalidatePath } from "next/cache";
import { requireOwner, requireTenant } from "@/lib/auth/require";
import {
  createMaintenanceRequest,
  updateMaintenanceStatus,
} from "@/lib/services/maintenance";
import { maintenanceRequestSchema } from "@/lib/validations/payment";
import type { MaintenanceStatus } from "@/types/database";
import type { AuthFormState } from "@/lib/auth/actions";

function firstIssue(issues: Array<{ message?: string }>): string {
  return issues[0]?.message ?? "Please check the form and try again";
}

export async function createMaintenanceRequestAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = maintenanceRequestSchema.safeParse({
    tenancy_id: formData.get("tenancy_id"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error.issues) };

  const { supabase } = await requireTenant();

  try {
    await createMaintenanceRequest(supabase, parsed.data);
  } catch (cause) {
    return {
      error: cause instanceof Error ? cause.message : "Could not submit request",
    };
  }

  revalidatePath("/tenant/maintenance");
  return { success: "Request submitted." };
}

export async function updateMaintenanceStatusAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as MaintenanceStatus;
  if (!id || !status) return;

  const { supabase } = await requireOwner();
  await updateMaintenanceStatus(supabase, id, status);
  revalidatePath("/owner/maintenance");
  revalidatePath("/tenant/maintenance");
}
