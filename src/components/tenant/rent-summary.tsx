"use client";

import { CalendarClockIcon, MessageCircleIcon, PhoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Money } from "@/components/shared/money";
import { StatusBadge } from "@/components/shared/status-badge";
import { diffMonthsDays, formatDate, isPast } from "@/lib/dates";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import type { TenantHome } from "@/lib/services/tenancies";

function whatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/[^\d]/g, "")}`;
}

export function RentSummary({ home }: { home: TenantHome }) {
  const { t, locale } = useI18n();

  const { months, days } = diffMonthsDays(home.move_in_date);
  const years = Math.floor(months / 12);
  const remainder = months % 12;

  const livedParts: string[] = [];
  if (years > 0) livedParts.push(`${years} ${t("units.year")}`);
  if (remainder > 0) livedParts.push(`${remainder} ${t("units.month")}`);
  if (livedParts.length === 0) livedParts.push(`${days} ${t("units.day")}`);

  const overdue = home.pending > 0 && home.next_due_date !== null && isPast(home.next_due_date);
  const clear = home.pending <= 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("tenant.monthlyRent")}
              </p>
              <p className="text-4xl font-semibold tracking-tight">
                <Money value={home.rent_amount} />
              </p>
            </div>
            <StatusBadge status={clear ? "paid" : overdue ? "overdue" : "pending"} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div
              className={cn(
                "rounded-lg border p-3",
                clear
                  ? "border-success/30 bg-success/10"
                  : "border-destructive/40 bg-destructive/10",
              )}
            >
              <p className="text-xs text-muted-foreground">{t("tenant.pending")}</p>
              <p
                className={cn(
                  "mt-1 text-xl font-semibold",
                  clear ? "text-success" : "text-destructive",
                )}
              >
                <Money value={home.pending} />
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">{t("tenant.nextDue")}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xl font-semibold">
                <CalendarClockIcon className="size-4 text-muted-foreground" aria-hidden />
                {home.next_due_date
                  ? formatDate(home.next_due_date, { locale, style: "short" })
                  : "—"}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">{t("tenant.livedHere")}</p>
              <p className="mt-1 text-xl font-semibold">{livedParts.join(" ")}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {[home.building_name, home.apartment_label].filter(Boolean).join(" · ")}
              </span>
              {home.owner_name ? <span> · {home.owner_name}</span> : null}
            </div>
            {home.owner_phone ? (
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={`tel:${home.owner_phone}`}>
                    <PhoneIcon aria-hidden />
                    {t("tenant.callOwner")}
                  </a>
                </Button>
                <Button asChild size="sm">
                  <a
                    href={whatsappHref(home.owner_phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircleIcon aria-hidden />
                    WhatsApp
                  </a>
                </Button>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
