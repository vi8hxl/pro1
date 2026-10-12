"use client";

import Link from "next/link";
import { ArrowRightIcon, ShieldCheckIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";
import { TenantPreview } from "./tenant-preview";

export function Hero() {
  const t = useT();

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 size-[36rem] rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            <SparklesIcon className="size-3.5 text-accent" aria-hidden />
            {t("landing.badge")}
          </span>

          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {t("landing.title")}
          </h1>

          <p className="max-w-xl text-lg text-muted-foreground">{t("landing.subtitle")}</p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">
                {t("landing.primaryCta")}
                <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#how-it-works">{t("landing.secondaryCta")}</Link>
            </Button>
          </div>

          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheckIcon className="size-4 text-success" aria-hidden />
            {t("landing.cta.body")}
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <TenantPreview />
        </div>
      </div>
    </section>
  );
}
