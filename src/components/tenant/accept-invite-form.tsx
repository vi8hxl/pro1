"use client";

import { useActionState } from "react";
import { useParams } from "next/navigation";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { acceptInviteAction, type AuthFormState } from "@/lib/auth/actions";
import { useT } from "@/lib/i18n/provider";

const initialState: AuthFormState = {};

/**
 * The token is read from the URL on the client so the route stays static
 * (a dynamic [token] segment blocks the metadata boundary during prerender).
 * If nobody is signed in, the action redirects to /login and comes back here.
 */
export function AcceptInviteForm() {
  const t = useT();
  const params = useParams<{ token: string }>();
  const token = typeof params?.token === "string" ? params.token : "";

  const [state, action, pending] = useActionState(acceptInviteAction, initialState);

  return (
    <form action={action} className="space-y-4">
      {state.error ? (
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <p className="text-sm text-muted-foreground">{t("invite.signInFirst")}</p>

      <input type="hidden" name="token" value={token} />

      <Button type="submit" className="w-full" disabled={pending || !token}>
        {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : null}
        {pending ? t("auth.saving") : t("invite.accept")}
      </Button>
    </form>
  );
}
