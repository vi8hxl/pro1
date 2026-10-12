"use client";

import { useActionState } from "react";
import { AlertCircleIcon, CircleCheckIcon, Loader2Icon, LogOutIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { signOut, updateAccount, type AuthFormState } from "@/lib/auth/actions";
import { localeLabels, locales } from "@/lib/i18n/config";
import { useT } from "@/lib/i18n/provider";

const initialState: AuthFormState = {};

export function AccountForm({
  fullName,
  locale,
  role,
}: {
  fullName: string | null;
  locale: string;
  role: string;
}) {
  const t = useT();
  const [state, action, pending] = useActionState(updateAccount, initialState);

  return (
    <div className="space-y-6">
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
          <Label>{t("account.role")}</Label>
          <div>
            <Badge variant="secondary">
              {role === "tenant" ? t("auth.roleTenant") : t("auth.roleOwner")}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name">{t("auth.fullName")}</Label>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={fullName ?? ""}
            maxLength={80}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="locale">{t("common.language")}</Label>
          <select
            id="locale"
            name="locale"
            defaultValue={locale}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
          >
            {locales.map((code) => (
              <option key={code} value={code}>
                {localeLabels[code]}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : null}
          {pending ? t("auth.saving") : t("account.save")}
        </Button>
      </form>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">{t("common.theme")}</span>
        <ThemeToggle />
      </div>

      <div className="border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void signOut();
          }}
        >
          <LogOutIcon aria-hidden />
          {t("nav.signOut")}
        </Button>
      </div>
    </div>
  );
}
