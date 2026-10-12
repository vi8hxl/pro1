"use client";

import { LifeBuoyIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/dates";
import { useT } from "@/lib/i18n/provider";
import type { MaintenanceRequest } from "@/lib/services/maintenance";

export function MaintenanceHistory({
  requests,
}: {
  requests: MaintenanceRequest[];
}) {
  const t = useT();

  if (requests.length === 0) {
    return <EmptyState icon={LifeBuoyIcon} />;
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-base">{request.title}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {formatDate(request.created_at, { style: "short" })}
              </p>
            </div>
            <StatusBadge
              status={
                request.status === "resolved"
                  ? "paid"
                  : request.status === "in_progress"
                    ? "pending"
                    : "overdue"
              }
              label={
                request.status === "resolved"
                  ? t("maintenance.resolved")
                  : request.status === "in_progress"
                    ? t("maintenance.inProgress")
                    : t("maintenance.open")
              }
            />
          </CardHeader>
          {request.description ? (
            <CardContent>
              <p className="text-sm text-muted-foreground">{request.description}</p>
            </CardContent>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
