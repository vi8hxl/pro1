"use client";

import { UnlinkIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { useT } from "@/lib/i18n/provider";

/** Shown to a tenant whose account has not been linked to a tenancy yet. */
export function UnlinkedTenantNotice() {
  const t = useT();

  return (
    <EmptyState
      icon={UnlinkIcon}
      title={t("tenant.unlinkedTitle")}
      description={t("tenant.unlinkedBody")}
    />
  );
}
