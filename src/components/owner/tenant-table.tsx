"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, LinkIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Money } from "@/components/shared/money";
import { StatusBadge, type ChargeStatus } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { diffMonthsDays, formatDate, isPast } from "@/lib/dates";
import { useI18n } from "@/lib/i18n/provider";
import type { TenancyListItem } from "@/lib/services/tenancies";

function statusFor(item: TenancyListItem): ChargeStatus {
  if (item.pending <= 0) return "paid";
  if (item.next_due_date && isPast(item.next_due_date)) return "overdue";
  return "pending";
}

function livedFor(moveIn: string, t: (k: string) => string): string {
  const { months, days } = diffMonthsDays(moveIn);
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${t("units.year")}`);
  if (remainder > 0) parts.push(`${remainder} ${t("units.month")}`);
  if (parts.length === 0) parts.push(`${days} ${t("units.day")}`);
  return parts.join(" ");
}

function InviteCell({ token }: { token: string }) {
  const t = useI18n().t;
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="xs"
      onClick={() => {
        const url = `${window.location.origin}/invite/${token}`;
        void navigator.clipboard.writeText(url);
        setCopied(true);
      }}
    >
      {copied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
      {copied ? t("tenants.copied") : t("tenants.copyInvite")}
    </Button>
  );
}

export function TenantTable({ tenancies }: { tenancies: TenancyListItem[] }) {
  const { t, locale } = useI18n();

  if (tenancies.length === 0) {
    return <EmptyState icon={UsersIcon} />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("dash.tenant")}</TableHead>
          <TableHead>{t("dash.status")}</TableHead>
          <TableHead className="text-right">{t("dash.pending")}</TableHead>
          <TableHead>{t("dash.lived")}</TableHead>
          <TableHead>{t("dash.lastPayment")}</TableHead>
          <TableHead>{t("tenants.account")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tenancies.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="font-medium">{item.tenant_name}</div>
              <div className="text-xs text-muted-foreground">
                {[item.building_name, item.apartment_label].filter(Boolean).join(" · ")}
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge status={statusFor(item)} />
            </TableCell>
            <TableCell className="text-right">
              <Money value={item.pending} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {livedFor(item.move_in_date, t)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {item.last_payment_on
                ? formatDate(item.last_payment_on, { locale, style: "short" })
                : "—"}
            </TableCell>
            <TableCell>
              {item.tenant_id ? (
                <span className="inline-flex items-center gap-1 text-xs text-success">
                  <LinkIcon className="size-3.5" aria-hidden />
                  {t("tenants.linked")}
                </span>
              ) : item.invite_token ? (
                <InviteCell token={item.invite_token} />
              ) : (
                <span className="text-xs text-muted-foreground">{t("tenants.notInvited")}</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
