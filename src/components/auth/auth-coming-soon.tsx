"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { LogoMark } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/lib/i18n/provider";

/**
 * Temporary screen shown until Module 3 wires real authentication
 * (phone OTP + email/password). Keeps the landing CTAs navigable meanwhile.
 */
export function AuthComingSoon({ mode }: { mode: "login" | "signup" }) {
  const t = useT();

  return (
    <Card className="w-full max-w-md">
      <CardContent className="space-y-4 pt-8 text-center">
        <LogoMark className="mx-auto size-10" />
        <h1 className="text-xl font-semibold">
          {mode === "login" ? t("common.login") : t("common.signup")}
        </h1>
        <p className="text-sm text-muted-foreground">
          Phone OTP and email sign-in arrive in the next module.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">
            <ArrowLeftIcon aria-hidden />
            {t("common.backHome")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
