import { LOCALE_COOKIE, defaultLocale, isLocale, type Locale } from "./config";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Fired after the locale cookie changes so subscribers can re-read it. */
export const LOCALE_EVENT = "rentless:locale-change";

export function readLocaleCookie(): Locale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`),
  );
  const value = match ? decodeURIComponent(match[1]) : null;
  return isLocale(value) ? value : null;
}

export function writeLocaleCookie(locale: Locale = defaultLocale): void {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
  window.dispatchEvent(new Event(LOCALE_EVENT));
}
