import { cn } from "@/lib/utils";
import { formatCurrency, type CurrencyCode } from "@/lib/money";

/**
 * Renders an amount with tabular digits so columns of figures line up.
 * Always uses Indian digit grouping for INR (Latin numerals), regardless of
 * the UI language.
 */
export function Money({
  value,
  currency = "INR",
  className,
  signDisplay,
}: {
  value: number | string | null | undefined;
  currency?: CurrencyCode;
  className?: string;
  signDisplay?: "auto" | "never" | "always";
}) {
  return (
    <span className={cn("nums", className)}>
      {formatCurrency(value, { currency, signDisplay })}
    </span>
  );
}
