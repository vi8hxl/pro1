"use client";

import { LifeBuoyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { updateMaintenanceStatusAction } from "@/lib/actions/maintenance";
import { formatDate } from "@/lib/dates";
import { useT } from "@/lib/i18n/provider";
import type { MaintenanceRequest } from "@/lib/services/maintenance";

const NEXT_ACTIONS: Record<string, Array<{ status: string; key: string }>> = {
  open: [
    { status: "in_progress", key: "maintenance.start" },
    { status: "resolved", key: "maintenance.resolve" },
  ],
  in_progress: [{ status: "resolved", key: "maintenance.resolve" }],
  resolved: [],
};

export function MaintenanceList({
  requests,
}: {
  requests: MaintenanceRequest[];
}) {
  const t = useT();

  if (requests.length === 0) {
    return <EmptyState icon={LifeBuoyIcon} />;
  }

  return (
    <div className="space-y-4">
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
          <CardContent className="space-y-3">
            {request.description ? (
              <p className="text-sm text-muted-foreground">{request.description}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {(NEXT_ACTIONS[request.status] ?? []).map((next) => (
                <form key={next.status} action={updateMaintenanceStatusAction}>
                  <input type="hidden" name="id" value={request.id} />
                  <input type="hidden" name="status" value={next.status} />
                  <Button type="submit" size="sm" variant="outline">
                    {t(next.key)}
                  </Button>
                </form>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
