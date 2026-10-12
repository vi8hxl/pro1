"use client";

import { useActionState } from "react";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeOnboarding, type AuthFormState } from "@/lib/auth/actions";
import { useT } from "@/lib/i18n/provider";
import { RolePicker } from "./role-picker";

const initialState: AuthFormState = {};

export function OnboardingForm({ defaultName }: { defaultName?: string | null }) {
  const t = useT();
  const [state, formAction, pending] = useActionState(completeOnboarding, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <RolePicker />

      <div className="space-y-2">
        <Label htmlFor="full_name">{t("auth.fullName")}</Label>
        <Input
          id="full_name"
          name="full_name"
          autoComplete="name"
          required
          maxLength={80}
          defaultValue={defaultName ?? ""}
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : null}
        {pending ? t("auth.saving") : t("auth.finish")}
      </Button>
    </form>
  );
}
