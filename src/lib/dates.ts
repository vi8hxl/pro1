export type DateInput = Date | string | number | null | undefined;

const DAY_MS = 24 * 60 * 60 * 1000;

export function toDate(input: DateInput): Date | null {
  if (input === null || input === undefined) return null;
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** ISO date (YYYY-MM-DD) in local time, safe for Postgres `date` columns. */
export function toISODate(input: DateInput): string | null {
  const date = toDate(input);
  if (!date) return null;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfMonth(input: DateInput): Date | null {
  const date = toDate(input);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function startOfDay(input: DateInput): Date | null {
  const date = toDate(input);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addMonths(input: DateInput, months: number): Date | null {
  const date = toDate(input);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

export function formatDate(
  input: DateInput,
  options: { locale?: string; style?: "short" | "medium" | "long" } = {},
): string {
  const date = toDate(input);
  if (!date) return "—";
  const style = options.style ?? "medium";
  const dateStyle = style === "short" ? "short" : style === "long" ? "long" : "medium";
  return new Intl.DateTimeFormat(options.locale ?? "en-IN", { dateStyle }).format(date);
}

export function formatMonthYear(input: DateInput, locale = "en-IN"): string {
  const date = toDate(input);
  if (!date) return "—";
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
}

/**
 * Whole-month + leftover-day difference used for "months lived".
 * Months are calendar-accurate, not 30-day approximations.
 */
export function diffMonthsDays(
  from: DateInput,
  to: DateInput = new Date(),
): { months: number; days: number } {
  const start = startOfDay(from);
  const end = startOfDay(to);
  if (!start || !end || end < start) return { months: 0, days: 0 };

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

  // Not yet a full month if we haven't reached the anchor day.
  if (end.getDate() < start.getDate()) months -= 1;

  const anchor = new Date(start.getFullYear(), start.getMonth() + months, start.getDate());
  const days = Math.max(0, Math.floor((end.getTime() - anchor.getTime()) / DAY_MS));
  return { months, days };
}

export function daysBetween(from: DateInput, to: DateInput = new Date()): number {
  const start = startOfDay(from);
  const end = startOfDay(to);
  if (!start || !end) return 0;
  return Math.round((end.getTime() - start.getTime()) / DAY_MS);
}

export function isPast(input: DateInput, now: Date = new Date()): boolean {
  const date = toDate(input);
  if (!date) return false;
  return date.getTime() < startOfDay(now)!.getTime();
}

export function addDays(input: DateInput, days: number): Date | null {
  const date = toDate(input);
  if (!date) return null;
  return new Date(date.getTime() + days * DAY_MS);
}
