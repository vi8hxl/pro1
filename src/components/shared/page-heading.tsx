"use client";

import { useT } from "@/lib/i18n/provider";

export function PageHeading({
  titleKey,
  subtitleKey,
  action,
}: {
  titleKey: string;
  subtitleKey?: string;
  action?: React.ReactNode;
}) {
  const t = useT();

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t(titleKey)}</h1>
        {subtitleKey ? (
          <p className="text-sm text-muted-foreground">{t(subtitleKey)}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
