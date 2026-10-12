import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type ChargeStatus = "paid" | "partial" | "pending" | "overdue" | "vacant" | "occupied";

const STATUS_STYLES: Record<ChargeStatus, string> = {
  paid: "border-success/30 bg-success/15 text-success",
  occupied: "border-info/30 bg-info/15 text-info",
  partial: "border-warning/30 bg-warning/15 text-warning",
  pending: "border-warning/40 bg-warning/20 text-warning",
  overdue: "border-destructive/40 bg-destructive/15 text-destructive",
  vacant: "border-border bg-muted text-muted-foreground",
};

const STATUS_LABELS: Record<ChargeStatus, string> = {
  paid: "Paid",
  partial: "Partial",
  pending: "Pending",
  overdue: "Overdue",
  vacant: "Vacant",
  occupied: "Occupied",
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: ChargeStatus;
  label?: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium", STATUS_STYLES[status], className)}
    >
      {label ?? STATUS_LABELS[status]}
    </Badge>
  );
}
