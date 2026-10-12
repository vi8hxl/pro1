import { Suspense } from "react";
import { connection } from "next/server";
import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading";
import { PageHeading } from "@/components/shared/page-heading";
import { formatDate } from "@/lib/dates";
import { requireUser } from "@/lib/auth/require";
import { markAllNotificationsReadAction } from "@/lib/actions/notifications";
import { listNotifications } from "@/lib/services/notifications";

export const metadata = { title: "Notifications" };

async function NotificationsData() {
  await connection();
  const { supabase } = await requireUser();
  const notifications = await listNotifications(supabase, { limit: 50 });

  if (notifications.length === 0) {
    return <EmptyState icon={BellIcon} />;
  }

  const hasUnread = notifications.some((item) => item.read_at === null);

  return (
    <div className="space-y-4">
      {hasUnread ? (
        <form action={markAllNotificationsReadAction} className="flex justify-end">
          <Button type="submit" variant="outline" size="sm">
            Mark all as read
          </Button>
        </form>
      ) : null}

      <ul className="divide-y divide-border rounded-xl border border-border">
        {notifications.map((item) => (
          <li key={item.id} className="flex items-start gap-3 p-4">
            <span
              className={
                item.read_at === null
                  ? "mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                  : "mt-1.5 size-2 shrink-0 rounded-full bg-transparent"
              }
              aria-hidden
            />
            <div className="min-w-0 space-y-1">
              <p className="font-medium">{item.title}</p>
              {item.body ? (
                <p className="text-sm text-muted-foreground">{item.body}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {formatDate(item.created_at, { style: "short" })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TenantNotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeading titleKey="nav.notifications" />
      <Suspense fallback={<LoadingSkeleton rows={4} />}>
        <NotificationsData />
      </Suspense>
    </div>
  );
}
