"use client";

import { useActionState, useState } from "react";
import { AlertCircleIcon, CircleCheckIcon, CopyIcon, Loader2Icon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTenancyAction, type InviteState } from "@/lib/actions/tenancy";
import { useT } from "@/lib/i18n/provider";
import type { ApartmentWithBuilding } from "@/lib/services/apartments";

const initial: InviteState = {};

export function AddTenantForm({
  apartments,
  today,
}: {
  apartments: ApartmentWithBuilding[];
  today: string;
}) {
  const t = useT();
  const [state, action, pending] = useActionState(createTenancyAction, initial);
  const [copied, setCopied] = useState(false);

  const inviteUrl =
    state.inviteToken && typeof window !== "undefined"
      ? `${window.location.origin}/invite/${state.inviteToken}`
      : null;

  if (apartments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          {t("tenants.needFlat")}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("tenants.addTenant")}</CardTitle>
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

          {inviteUrl ? (
            <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs font-medium">{t("tenants.inviteLink")}</p>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate text-xs">{inviteUrl}</code>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard.writeText(inviteUrl);
                    setCopied(true);
                  }}
                >
                  <CopyIcon aria-hidden />
                  {copied ? t("tenants.copied") : t("tenants.copy")}
                </Button>
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="apartment_id">{t("tenants.flat")}</Label>
              <select
                id="apartment_id"
                name="apartment_id"
                required
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                {apartments.map((apartment) => (
                  <option key={apartment.id} value={apartment.id}>
                    {[apartment.building_name, apartment.label].filter(Boolean).join(" · ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant_name">{t("tenants.name")}</Label>
              <Input id="tenant_name" name="tenant_name" required maxLength={80} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant_phone">{t("tenants.phone")}</Label>
              <Input id="tenant_phone" name="tenant_phone" maxLength={20} placeholder="+91..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant_email">{t("tenants.email")}</Label>
              <Input id="tenant_email" name="tenant_email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="move_in_date">{t("tenants.moveIn")}</Label>
              <Input id="move_in_date" name="move_in_date" type="date" required defaultValue={today} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rent_amount">{t("tenants.rent")}</Label>
              <Input id="rent_amount" name="rent_amount" type="number" min={1} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_day">{t("tenants.dueDay")}</Label>
              <Input id="due_day" name="due_day" type="number" min={1} max={28} defaultValue={1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit_amount">{t("tenants.deposit")}</Label>
              <Input id="deposit_amount" name="deposit_amount" type="number" min={0} defaultValue={0} />
            </div>
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : null}
            {t("tenants.addTenant")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
