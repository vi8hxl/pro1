"use client";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";

export function CtaSection() {
  const t = useT();

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-accent/30 blur-3xl"
          />
          <div className="relative mx-auto max-w-xl space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("landing.cta.title")}
            </h2>
            <p className="text-primary-foreground/80">{t("landing.cta.body")}</p>
            <div className="flex justify-center pt-2">
              <Button asChild size="lg" variant="secondary">
                <Link href="/signup">
                  {t("landing.cta.button")}
                  <ArrowRightIcon aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
