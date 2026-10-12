export const locales = ["en", "hi"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Cookie that persists the visitor's language choice across sessions. */
export const LOCALE_COOKIE = "rentless_locale";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
};

export const localeShortLabels: Record<Locale, string> = {
  en: "EN",
  hi: "हिं",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
