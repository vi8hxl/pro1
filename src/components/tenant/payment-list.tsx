"use client";

import { ReceiptIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Money } from "@/components/shared/money";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/dates";
import { useT } from "@/lib/i18n/provider";
import type { Payment } from "@/lib/services/payments";

const MODE_KEYS: Record<string, string> = {
  cash: "pay.cash",
  upi: "pay.upi",
  bank: "pay.bank",
  other: "pay.other",
};

export function PaymentList({ payments }: { payments: Payment[] }) {
  const t = useT();

  if (payments.length === 0) {
    return <EmptyState icon={ReceiptIcon} />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("pay.date")}</TableHead>
          <TableHead>{t("pay.mode")}</TableHead>
          <TableHead className="text-right">{t("pay.amount")}</TableHead>
          <TableHead>{t("pay.receipt")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{formatDate(payment.paid_on, { style: "short" })}</TableCell>
            <TableCell className="text-muted-foreground">
              {t(MODE_KEYS[payment.mode] ?? "pay.other")}
            </TableCell>
            <TableCell className="text-right">
              <Money value={payment.amount} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {payment.receipt_no ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
