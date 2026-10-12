import en from "../../../messages/en.json";
import hi from "../../../messages/hi.json";
import { defaultLocale, type Locale } from "./config";

export type Messages = typeof en;

export const messagesByLocale: Record<Locale, Messages> = {
  en,
  hi: hi as unknown as Messages,
};

export function getMessages(locale: Locale): Messages {
  return messagesByLocale[locale] ?? messagesByLocale[defaultLocale];
}
