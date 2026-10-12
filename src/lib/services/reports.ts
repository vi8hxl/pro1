import { getOwnerMonthly } from "./dashboard";
import type { DbClient } from "./client";

export interface ReportRow {
  period_month: string;
  expected: number;
  collected: number;
  pending: number;
}

/** Collected vs pending per month — the basis of the owner reports screen. */
export async function getCollectedVsPending(
  client: DbClient,
  months = 12,
): Promise<ReportRow[]> {
  const points = await getOwnerMonthly(client, months);
  return points.map((point) => ({
    period_month: point.period_month,
    expected: point.expected,
    collected: point.collected,
    pending: point.expected - point.collected,
  }));
}

type CsvValue = string | number | boolean | null | undefined;

function escapeCsv(value: CsvValue): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Minimal RFC-4180-style CSV serialiser (used by the export route). */
export function toCsv(headers: string[], rows: CsvValue[][]): string {
  const lines = [headers.map(escapeCsv).join(",")];
  for (const row of rows) lines.push(row.map(escapeCsv).join(","));
  return lines.join("\n");
}
