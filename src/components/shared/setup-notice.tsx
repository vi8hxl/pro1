import { DatabaseIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Shown instead of a crash when NEXT_PUBLIC_SUPABASE_URL / ANON_KEY are missing.
 * This is a setup screen, not product UI, so it is intentionally in English.
 */
export function SetupNotice() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="gap-2">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <DatabaseIcon className="size-5" aria-hidden />
        </span>
        <CardTitle>Connect a database to continue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>
          Sign-in needs a Supabase project. Rentless has no backend configured yet, so
          there is nothing to authenticate against.
        </p>

        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Create a free project at <span className="font-medium text-foreground">supabase.com</span>{" "}
            (region: Mumbai).
          </li>
          <li>
            <span className="font-medium text-foreground">Project Settings → API</span> → copy the{" "}
            <span className="font-medium text-foreground">Project URL</span> and{" "}
            <span className="font-medium text-foreground">anon</span> key.
          </li>
          <li>
            Paste them into <span className="font-medium text-foreground">.env.local</span> in the
            project root:
          </li>
        </ol>

        <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs text-foreground">
{`NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`}
        </pre>

        <ol className="list-decimal space-y-2 pl-5" start={4}>
          <li>
            In Supabase, open the <span className="font-medium text-foreground">SQL Editor</span> and
            run <span className="font-medium text-foreground">supabase/apply_all.sql</span>.
          </li>
          <li>
            Turn off <span className="font-medium text-foreground">Authentication → Email → Confirm
            email</span> while testing.
          </li>
          <li>Restart the dev server.</li>
        </ol>

        <p className="rounded-lg border border-border bg-muted/40 p-3">
          Both values are public and safe to share. The{" "}
          <span className="font-medium text-foreground">service_role</span> key is secret — never add
          it here.
        </p>
      </CardContent>
    </Card>
  );
}
