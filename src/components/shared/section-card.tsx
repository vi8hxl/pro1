"use client";

import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useT } from "@/lib/i18n/provider";

/** A titled card whose heading can be translated from a server-rendered page. */
export function SectionCard({
  titleKey,
  action,
  children,
  contentClassName,
}: {
  titleKey: string;
  action?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}) {
  const t = useT();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>{t(titleKey)}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
