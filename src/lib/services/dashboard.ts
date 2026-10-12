import { type DbClient, unwrap } from "./client";

export interface OwnerDashboard {
  expected_this_month: number;
  collected_this_month: number;
  total_pending: number;
  tenant_count: number;
  vacant_count: number;
}

export interface OwnerMonthlyPoint {
  period_month: string;
  expected: number;
  collected: number;
}

/** Single-round-trip rollup for the owner dashboard. */
export async function getOwnerDashboard(client: DbClient): Promise<OwnerDashboard> {
  const data = unwrap(await client.rpc("rpc_owner_dashboard", {}));
  const dashboard = data as unknown as Partial<OwnerDashboard> | null;
  return {
    expected_this_month: Number(dashboard?.expected_this_month ?? 0),
    collected_this_month: Number(dashboard?.collected_this_month ?? 0),
    total_pending: Number(dashboard?.total_pending ?? 0),
    tenant_count: Number(dashboard?.tenant_count ?? 0),
    vacant_count: Number(dashboard?.vacant_count ?? 0),
  };
}

/** Last N months of expected vs collected (dashboard chart + reports). */
export async function getOwnerMonthly(
  client: DbClient,
  months = 6,
): Promise<OwnerMonthlyPoint[]> {
  const rows = unwrap(await client.rpc("rpc_owner_monthly", { p_months: months }));
  return (rows ?? []).map((row) => ({
    period_month: row.period_month,
    expected: Number(row.expected ?? 0),
    collected: Number(row.collected ?? 0),
  }));
}
