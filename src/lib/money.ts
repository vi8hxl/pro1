import { DEFAULT_CURRENCY } from "./constants";

export type CurrencyCode = "INR" | (string & {});

const LOCALE_BY_CURRENCY: Record<string, string> = {
  INR: "en-IN",
};

function resolveLocale(currency: CurrencyCode, locale?: string) {
  if (locale) return locale;
  return LOCALE_BY_CURRENCY[currency] ?? "en-US";
}

/**
 * Format an amount as currency. Whole rupees stay clean (₹1,200) while
 * paise are shown only when present. Indian digit grouping is used for INR.
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  options: { currency?: CurrencyCode; locale?: string; signDisplay?: "auto" | "never" | "always" } = {},
): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  const safe = Number.isFinite(value as number) ? (value as number) : 0;
  const currency = options.currency ?? DEFAULT_CURRENCY;

  return new Intl.NumberFormat(resolveLocale(currency, options.locale), {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    signDisplay: options.signDisplay ?? "auto",
  }).format(safe);
}

/**
 * Short, chart-friendly currency: ₹1.2K, ₹4.5L, ₹1.2Cr (Indian units).
 */
export function formatCurrencyCompact(
  amount: number | string | null | undefined,
  options: { currency?: CurrencyCode; locale?: string } = {},
): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  const safe = Number.isFinite(value as number) ? (value as number) : 0;
  const currency = options.currency ?? DEFAULT_CURRENCY;
  const symbol = currency === "INR" ? "₹" : `${currency} `;
  const abs = Math.abs(safe);

  const units: Array<[number, string]> = [
    [1_00_00_000, "Cr"],
    [1_00_000, "L"],
    [1_000, "K"],
  ];

  for (const [threshold, suffix] of units) {
    if (abs >= threshold) {
      const scaled = safe / threshold;
      const digits = Math.abs(scaled) >= 100 ? 0 : 1;
      return `${symbol}${scaled.toFixed(digits)}${suffix}`;
    }
  }

  return formatCurrency(safe, options);
}
