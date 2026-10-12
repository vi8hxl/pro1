"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/services/notifications";

export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { supabase } = await requireUser();
  await markNotificationRead(supabase, id);
  revalidatePath("/tenant/notifications");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const { supabase } = await requireUser();
  await markAllNotificationsRead(supabase);
  revalidatePath("/tenant/notifications");
}
