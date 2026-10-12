"use client";

import { Building2Icon, CheckIcon, HomeIcon, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/lib/i18n/provider";

const POINTS = ["one", "two", "three", "four"] as const;

function RoleCard({
  role,
  icon: Icon,
  accent,
}: {
  role: "owners" | "tenants";
  icon: LucideIcon;
  accent: string;
}) {
  const t = useT();

  return (
    <Card className="h-full">
      <CardContent className="space-y-5 pt-6">
        <div className="flex items-center gap-3">
          <span className={`flex size-10 items-center justify-center rounded-lg ${accent}`}>
            <Icon className="size-5" aria-hidden />
          </span>
          <h3 className="text-lg font-semibold">{t(`landing.roles.${role}.title`)}</h3>
        </div>
        <ul className="space-y-3">
          {POINTS.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              <span className="text-muted-foreground">
                {t(`landing.roles.${role}.points.${point}`)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function Roles() {
  const t = useT();

  return (
    <section id="roles" className="scroll-mt-20 border-t border-border bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("landing.roles.title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("landing.roles.subtitle")}</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <RoleCard role="owners" icon={Building2Icon} accent="bg-primary/10 text-primary" />
          <RoleCard role="tenants" icon={HomeIcon} accent="bg-accent/15 text-accent" />
        </div>
      </div>
    </section>
  );
}
