"use client";

import { useActionState } from "react";
import { AlertCircleIcon, CircleCheckIcon, Loader2Icon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAccount, type AuthFormState } from "@/lib/auth/actions";
import { useT } from "@/lib/i18n/provider";

const initialState: AuthFormState = {};

const CURRENCIES = ["INR", "USD", "AED", "GBP"];

export function OwnerSettingsForm({
  currency,
  gracePeriodDays,
}: {
  currency: string;
  gracePeriodDays: number;
}) {
  const t = useT();
  const [state, action, pending] = useActionState(updateAccount, initialState);

  return (
    <form action={action} className="space-y-4">
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

      <div className="space-y-2">
        <Label htmlFor="currency">{t("settings.currency")}</Label>
        <select
          id="currency"
          name="currency"
          defaultValue={currency}
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
        >
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="grace_period_days">{t("settings.grace")}</Label>
        <Input
          id="grace_period_days"
          name="grace_period_days"
          type="number"
          min={0}
          max={30}
          defaultValue={gracePeriodDays}
        />
        <p className="text-xs text-muted-foreground">{t("settings.graceHint")}</p>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : null}
        {pending ? t("auth.saving") : t("account.save")}
      </Button>
    </form>
  );
}
