import { type DbClient, unwrap } from "./client";

/**
 * Ask the database to create any rent upcoming/overdue reminders for the
 * signed-in tenant. Idempotent per charge per day, so it is safe to call on
 * every page load (no cron required).
 */
export async function syncMyReminders(client: DbClient): Promise<number> {
  return unwrap(await client.rpc("rpc_sync_my_reminders", {}));
}
