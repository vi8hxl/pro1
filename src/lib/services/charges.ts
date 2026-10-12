import { toISODate } from "@/lib/dates";
import type { Tables } from "@/types/database";
import { type DbClient, unwrap } from "./client";

export type RentCharge = Tables<"rent_charges">;

export async function listChargesByTenancy(
  client: DbClient,
  tenancyId: string,
): Promise<RentCharge[]> {
  return unwrap(
    await client
      .from("rent_charges")
      .select("*")
      .eq("tenancy_id", tenancyId)
      .order("period_month", { ascending: false }),
  );
}

export async function listOwnerCharges(
  client: DbClient,
  options: { periodMonth?: string } = {},
): Promise<RentCharge[]> {
  let query = client
    .from("rent_charges")
    .select("*")
    .order("due_date", { ascending: false });
  if (options.periodMonth) query = query.eq("period_month", options.periodMonth);
  return unwrap(await query);
}

/**
 * Generate this month's charges for every active tenancy whose due day has
 * arrived. Safe to call repeatedly — the unique key prevents duplicates.
 */
export async function generateMonthlyCharges(
  client: DbClient,
  runDate?: string,
): Promise<number> {
  return unwrap(
    await client.rpc("fn_generate_monthly_charges", {
      ...(runDate ? { p_run_date: runDate } : {}),
    }),
  );
}

/** Flip charges past their grace period to overdue. */
export async function markOverdue(client: DbClient): Promise<number> {
  return unwrap(await client.rpc("fn_mark_overdue", {}));
}

export function currentPeriodMonth(): string {
  const now = new Date();
  return toISODate(new Date(now.getFullYear(), now.getMonth(), 1)) ?? "";
}
