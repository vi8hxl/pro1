"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircleIcon, CircleCheckIcon, Loader2Icon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpWithEmail, type AuthFormState } from "@/lib/auth/actions";
import { useT } from "@/lib/i18n/provider";
import { RolePicker } from "./role-picker";

const initialState: AuthFormState = {};

export function SignupForm() {
  const t = useT();
  const [state, formAction, pending] = useActionState(signUpWithEmail, initialState);

  return (
    <form action={formAction} className="space-y-5">
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

      <RolePicker />

      <div className="space-y-2">
        <Label htmlFor="full_name">{t("auth.fullName")}</Label>
        <Input id="full_name" name="full_name" autoComplete="name" required maxLength={80} />
      </div>

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
          autoComplete="new-password"
          required
          minLength={8}
        />
        <p className="text-xs text-muted-foreground">{t("auth.passwordHint")}</p>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : null}
        {pending ? t("auth.creating") : t("common.signup")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.haveAccount")}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("common.login")}
        </Link>
      </p>
    </form>
  );
}
