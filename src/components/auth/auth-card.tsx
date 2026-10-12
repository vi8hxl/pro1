"use client";

import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogoMark } from "@/components/layout/logo";
import { useT } from "@/lib/i18n/provider";

export function AuthCard({
  titleKey,
  subtitleKey,
  children,
}: {
  titleKey: string;
  subtitleKey: string;
  children: ReactNode;
}) {
  const t = useT();

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center gap-2 text-center">
        <LogoMark className="mx-auto size-10" />
        <CardTitle className="text-xl">{t(titleKey)}</CardTitle>
        <CardDescription>{t(subtitleKey)}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
