import { formatMonthYear } from "@/lib/dates";
import { getCollectedVsPending, toCsv } from "@/lib/services/reports";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rows = await getCollectedVsPending(supabase, 24);
  const csv = toCsv(
    ["Month", "Expected", "Collected", "Pending"],
    rows.map((row) => [
      formatMonthYear(row.period_month),
      row.expected,
      row.collected,
      row.pending,
    ]),
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="rentless-report.csv"',
      "Cache-Control": "no-store",
    },
  });
}
