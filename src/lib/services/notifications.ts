import type { Tables } from "@/types/database";
import { type DbClient, unwrap, unwrapVoid } from "./client";

export type Notification = Tables<"notifications">;

export async function listNotifications(
  client: DbClient,
  options: { unreadOnly?: boolean; limit?: number } = {},
): Promise<Notification[]> {
  let query = client
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (options.unreadOnly) query = query.is("read_at", null);
  if (options.limit) query = query.limit(options.limit);
  return unwrap(await query);
}

export async function unreadNotificationCount(client: DbClient): Promise<number> {
  const rows = unwrap(
    await client.from("notifications").select("id").is("read_at", null),
  );
  return rows.length;
}

export async function markNotificationRead(
  client: DbClient,
  id: string,
): Promise<void> {
  unwrapVoid(
    await client
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id),
  );
}

export async function markAllNotificationsRead(client: DbClient): Promise<void> {
  unwrapVoid(
    await client
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null),
  );
}
