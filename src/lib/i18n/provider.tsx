"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { defaultLocale, type Locale } from "./config";
import { LOCALE_EVENT, readLocaleCookie, writeLocaleCookie } from "./cookie";
import { getMessages, type Messages } from "./messages";

type TFunction = (key: string, vars?: Record<string, string | number>) => string;

interface I18nValue {
  locale: Locale;
  messages: Messages;
  t: TFunction;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

function subscribe(onChange: () => void) {
  window.addEventListener(LOCALE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(LOCALE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function resolvePath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] !== undefined ? String(vars[key]) : `{${key}}`,
  );
}

export function I18nProvider({
  children,
  initialLocale = defaultLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  // The cookie is the source of truth; subscribing to it avoids a state/effect
  // round-trip and keeps the server render stable (initialLocale).
  const locale = useSyncExternalStore(
    subscribe,
    () => readLocaleCookie() ?? initialLocale,
    () => initialLocale,
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    writeLocaleCookie(next);
  }, []);

  const value = useMemo<I18nValue>(() => {
    const messages = getMessages(locale);
    const t: TFunction = (key, vars) => {
      const found = resolvePath(messages, key);
      if (typeof found === "string") return interpolate(found, vars);
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[i18n] missing key: ${key}`);
      }
      return key;
    };
    return { locale, messages, t, setLocale };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside <I18nProvider>");
  }
  return context;
}

export function useT(): TFunction {
  return useI18n().t;
}
