"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require";
import { createApartment, deleteApartment } from "@/lib/services/apartments";
import { createBuilding, deleteBuilding } from "@/lib/services/buildings";
import { apartmentSchema, buildingSchema } from "@/lib/validations/property";
import type { AuthFormState } from "@/lib/auth/actions";

function firstIssue(issues: Array<{ message?: string }>): string {
  return issues[0]?.message ?? "Please check the form and try again";
}

export async function createBuildingAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = buildingSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error.issues) };

  const { supabase, userId } = await requireOwner();

  try {
    await createBuilding(supabase, userId, parsed.data);
  } catch (cause) {
    return { error: cause instanceof Error ? cause.message : "Could not save" };
  }

  revalidatePath("/owner/buildings");
  return { success: "Building added." };
}

export async function deleteBuildingAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { supabase } = await requireOwner();
  await deleteBuilding(supabase, id);
  revalidatePath("/owner/buildings");
}

export async function createApartmentAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = apartmentSchema.safeParse({
    building_id: formData.get("building_id"),
    label: formData.get("label"),
    floor: formData.get("floor") || undefined,
    base_rent: formData.get("base_rent"),
    security_deposit: formData.get("security_deposit") || 0,
    notes: "",
  });
  if (!parsed.success) return { error: firstIssue(parsed.error.issues) };

  const { supabase, userId } = await requireOwner();

  try {
    await createApartment(supabase, userId, parsed.data);
  } catch (cause) {
    return { error: cause instanceof Error ? cause.message : "Could not save" };
  }

  revalidatePath("/owner/buildings");
  return { success: "Flat added." };
}

export async function deleteApartmentAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { supabase } = await requireOwner();
  try {
    await deleteApartment(supabase, id);
  } catch {
    // FK-restricted when a tenancy references it — surfaced by the UI.
  }
  revalidatePath("/owner/buildings");
}
