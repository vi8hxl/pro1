"use client";

import { DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/shared/money";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMonthYear } from "@/lib/dates";
import { useT } from "@/lib/i18n/provider";
import type { ReportRow } from "@/lib/services/reports";

export function ReportTable({ rows }: { rows: ReportRow[] }) {
  const t = useT();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm">
          <a href="/api/reports/export" download>
            <DownloadIcon aria-hidden />
            {t("reports.export")}
          </a>
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("reports.month")}</TableHead>
              <TableHead className="text-right">{t("dash.expected")}</TableHead>
              <TableHead className="text-right">{t("dash.collected")}</TableHead>
              <TableHead className="text-right">{t("dash.pending")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.period_month}>
                <TableCell>{formatMonthYear(row.period_month)}</TableCell>
                <TableCell className="text-right">
                  <Money value={row.expected} />
                </TableCell>
                <TableCell className="text-right text-success">
                  <Money value={row.collected} />
                </TableCell>
                <TableCell className="text-right">
                  <Money
                    value={row.pending}
                    className={row.pending > 0 ? "text-destructive" : undefined}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
