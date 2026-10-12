"use client";

import { Building2Icon, SendIcon, TrendingUpIcon, type LucideIcon } from "lucide-react";
import { useT } from "@/lib/i18n/provider";

const STEPS: Array<{ key: string; icon: LucideIcon }> = [
  { key: "one", icon: Building2Icon },
  { key: "two", icon: SendIcon },
  { key: "three", icon: TrendingUpIcon },
];

export function HowItWorks() {
  const t = useT();

  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("landing.how.title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("landing.how.subtitle")}</p>
        </div>

        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ key, icon: Icon }, index) => (
            <li key={key} className="relative flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{t(`landing.how.steps.${key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">
                {t(`landing.how.steps.${key}.body`)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
