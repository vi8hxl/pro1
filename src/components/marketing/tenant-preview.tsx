"use client";

import { CalendarClockIcon, HomeIcon, TrendingUpIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Money } from "@/components/shared/money";
import { useT } from "@/lib/i18n/provider";

/**
 * A static preview of the tenant home screen, built from the same design
 * tokens and components the real dashboards use — so the landing page shows
 * the product honestly.
 */
export function TenantPreview() {
  const t = useT();

  return (
    <Card className="w-full max-w-sm overflow-hidden shadow-lg">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <HomeIcon className="size-4 text-primary" aria-hidden />
          Flat B-204
        </div>
        <StatusBadge status="paid" />
      </div>
      <CardContent className="space-y-5 pt-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("landing.stats.collected")}
          </p>
          <p className="text-4xl font-semibold tracking-tight text-foreground">
            <Money value={12000} />
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-success/30 bg-success/10 p-3">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="mt-1 text-xl font-semibold text-success">
              <Money value={0} />
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Rent</p>
            <p className="mt-1 text-xl font-semibold">
              <Money value={12000} />
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
              <CalendarClockIcon className="size-4" aria-hidden />
              Next due
            </span>
            <span className="font-medium">1 Nov 2026</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
              <TrendingUpIcon className="size-4" aria-hidden />
              Lived here
            </span>
            <span className="font-medium">1 yr 3 mo</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
