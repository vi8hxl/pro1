"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircleIcon, CircleCheckIcon, Loader2Icon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithEmail, type AuthFormState } from "@/lib/auth/actions";
import { PHONE_AUTH_ENABLED } from "@/lib/auth/constants";
import { useT } from "@/lib/i18n/provider";

const initialState: AuthFormState = {};

export function LoginForm() {
  const t = useT();
  const [state, formAction, pending] = useActionState(signInWithEmail, initialState);

  return (
    <form action={formAction} className="space-y-4">
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
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("auth.password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : null}
        {pending ? t("auth.signingIn") : t("common.login")}
      </Button>

      {!PHONE_AUTH_ENABLED ? (
        <p className="text-center text-xs text-muted-foreground">
          {t("auth.phoneComingSoon")}
        </p>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.noAccount")}{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          {t("common.signup")}
        </Link>
      </p>
    </form>
  );
}
