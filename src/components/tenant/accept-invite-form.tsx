"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { acceptInviteAction, type AuthFormState } from "@/lib/auth/actions";
import { useT } from "@/lib/i18n/provider";

const initialState: AuthFormState = {};

export function AcceptInviteForm({
  token,
  signedIn,
}: {
  token: string;
  signedIn: boolean;
}) {
  const t = useT();
  const [state, action, pending] = useActionState(acceptInviteAction, initialState);

  if (!signedIn) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t("invite.signInFirst")}</p>
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href={`/login?next=/invite/${token}`}>
              {t("common.login")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/signup?next=/invite/${token}`}>
              {t("common.signup")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state.error ? (
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <input type="hidden" name="token" value={token} />

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : null}
        {pending ? t("auth.saving") : t("invite.accept")}
      </Button>
    </form>
  );
}
