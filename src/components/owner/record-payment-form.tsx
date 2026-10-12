"use client";

import { useActionState } from "react";
import { AlertCircleIcon, CircleCheckIcon, Loader2Icon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recordPaymentAction } from "@/lib/actions/payment";
import type { AuthFormState } from "@/lib/auth/actions";
import { useT } from "@/lib/i18n/provider";

const initial: AuthFormState = {};

export function RecordPaymentForm({
  tenancies,
  today,
}: {
  tenancies: Array<{ id: string; label: string; pending: number }>;
  today: string;
}) {
  const t = useT();
  const [state, action, pending] = useActionState(recordPaymentAction, initial);

  if (tenancies.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          {t("pay.needTenant")}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("pay.record")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-3">
          {state.error ? (
            <Alert variant="destructive">
              <AlertCircleIcon aria-hidden />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          {state.success ? (
            <Alert>
              <CircleCheckIcon aria-hidden />
              <AlertDescription>{state.success}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="tenancy_id">{t("pay.tenant")}</Label>
              <select
                id="tenancy_id"
                name="tenancy_id"
                required
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                {tenancies.map((tenancy) => (
                  <option key={tenancy.id} value={tenancy.id}>
                    {tenancy.label}
                    {tenancy.pending > 0 ? ` — ₹${tenancy.pending} due` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">{t("pay.amount")}</Label>
              <Input id="amount" name="amount" type="number" min={1} step="0.01" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paid_on">{t("pay.date")}</Label>
              <Input id="paid_on" name="paid_on" type="date" required defaultValue={today} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">{t("pay.mode")}</Label>
              <select
                id="mode"
                name="mode"
                defaultValue="cash"
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="cash">{t("pay.cash")}</option>
                <option value="upi">{t("pay.upi")}</option>
                <option value="bank">{t("pay.bank")}</option>
                <option value="other">{t("pay.other")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">{t("pay.note")}</Label>
              <Input id="note" name="note" maxLength={300} />
            </div>
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : null}
            {t("pay.record")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
