"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { useT } from "@/lib/i18n/provider";

export function SiteFooter() {
  const t = useT();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">{t("footer.tagline")}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold">{t("footer.product")}</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="#features" className="hover:text-foreground">
                {t("footer.features")}
              </Link>
            </li>
            <li>
              <Link href="#how-it-works" className="hover:text-foreground">
                {t("footer.howItWorks")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold">{t("footer.account")}</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/login" className="hover:text-foreground">
                {t("footer.login")}
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-foreground">
                {t("footer.signup")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {year} Rentless. {t("footer.rights")}
          </p>
          <p>{t("footer.madeWith")}</p>
        </div>
      </div>
    </footer>
  );
}
