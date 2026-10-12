"use client";

import {
  BellRingIcon,
  CalendarClockIcon,
  FileTextIcon,
  LayersIcon,
  SmartphoneIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/lib/i18n/provider";

const ITEMS: Array<{ key: string; icon: LucideIcon }> = [
  { key: "dues", icon: WalletIcon },
  { key: "auto", icon: CalendarClockIcon },
  { key: "partial", icon: LayersIcon },
  { key: "reminders", icon: BellRingIcon },
  { key: "reports", icon: FileTextIcon },
  { key: "tenantApp", icon: SmartphoneIcon },
];

export function Features() {
  const t = useT();

  return (
    <section id="features" className="scroll-mt-20 border-t border-border bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("landing.features.title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("landing.features.subtitle")}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ key, icon: Icon }) => (
            <Card key={key} className="h-full">
              <CardContent className="space-y-3 pt-6">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="font-semibold">{t(`landing.features.items.${key}.title`)}</h3>
                <p className="text-sm text-muted-foreground">
                  {t(`landing.features.items.${key}.body`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
