import { Suspense } from "react";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      {/* The copyright year reads the current time, which must be deferred
          rather than baked into the prerender (Cache Components). */}
      <Suspense fallback={<div className="h-72 border-t border-border bg-muted/30" />}>
        <SiteFooter />
      </Suspense>
    </div>
  );
}
