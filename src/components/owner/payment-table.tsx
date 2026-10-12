"use client";

import { ReceiptIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { deletePaymentAction } from "@/lib/actions/payment";
import { formatDate } from "@/lib/dates";
import { useT } from "@/lib/i18n/provider";
import type { Payment } from "@/lib/services/payments";

const MODE_KEYS: Record<string, string> = {
  cash: "pay.cash",
  upi: "pay.upi",
  bank: "pay.bank",
  other: "pay.other",
};

export function PaymentTable({
  payments,
  labels,
}: {
  payments: Payment[];
  labels: Record<string, string>;
}) {
  const t = useT();

  if (payments.length === 0) {
    return <EmptyState icon={ReceiptIcon} />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("pay.date")}</TableHead>
          <TableHead>{t("pay.tenant")}</TableHead>
          <TableHead>{t("pay.mode")}</TableHead>
          <TableHead className="text-right">{t("pay.amount")}</TableHead>
          <TableHead>{t("pay.receipt")}</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{formatDate(payment.paid_on, { style: "short" })}</TableCell>
            <TableCell>{labels[payment.tenancy_id] ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground">
              {t(MODE_KEYS[payment.mode] ?? "pay.other")}
            </TableCell>
            <TableCell className="text-right">
              <Money value={payment.amount} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {payment.receipt_no ?? "—"}
            </TableCell>
            <TableCell className="text-right">
              <form action={deletePaymentAction}>
                <input type="hidden" name="id" value={payment.id} />
                <Button type="submit" variant="ghost" size="icon" aria-label="Delete payment">
                  <Trash2Icon aria-hidden />
                </Button>
              </form>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
