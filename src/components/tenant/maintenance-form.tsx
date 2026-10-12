"use client";

import { useActionState } from "react";
import { AlertCircleIcon, CircleCheckIcon, Loader2Icon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createMaintenanceRequestAction } from "@/lib/actions/maintenance";
import type { AuthFormState } from "@/lib/auth/actions";
import { useT } from "@/lib/i18n/provider";

const initial: AuthFormState = {};

export function MaintenanceForm({ tenancyId }: { tenancyId: string }) {
  const t = useT();
  const [state, action, pending] = useActionState(
    createMaintenanceRequestAction,
    initial,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("maintenance.newRequest")}</CardTitle>
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

          <input type="hidden" name="tenancy_id" value={tenancyId} />

          <div className="space-y-2">
            <Label htmlFor="title">{t("maintenance.title")}</Label>
            <Input id="title" name="title" required maxLength={120} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t("maintenance.description")}</Label>
            <Textarea id="description" name="description" rows={3} maxLength={1000} />
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : null}
            {t("maintenance.submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
