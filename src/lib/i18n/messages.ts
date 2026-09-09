import { interpolate, lookupMessage, tValue } from "./core.ts";
import { en } from "./en.ts";
import { hi } from "./hi.ts";
import type { DotPaths, Language, NestedMessages } from "./types.ts";

export type MessageKey = DotPaths<typeof en>;
export type TranslateVars = Record<string, string | number>;
export type TranslateFn = (key: MessageKey, vars?: TranslateVars) => string;

export const dictionaries: Record<Language, NestedMessages> = {
  en: en as NestedMessages,
  hi: hi as NestedMessages,
};

export const VOLUNTEER_INTERESTS = [
  { value: "Fundraising and donor outreach", key: "fundraising" },
  { value: "Relief logistics", key: "logistics" },
  { value: "Medical and first-aid support", key: "medical" },
  { value: "Community coordination", key: "community" },
  { value: "Communications and translation", key: "communications" },
  { value: "Remote administration", key: "remote" },
] as const;

export const VOLUNTEER_AVAILABILITY = [
  { value: "Weekdays", key: "weekdays" },
  { value: "Weekends", key: "weekends" },
  { value: "Evenings only", key: "evenings" },
  { value: "On-call / emergency", key: "oncall" },
  { value: "A few hours a week", key: "fewHours" },
  { value: "Full-time for a limited period", key: "fullTime" },
] as const;

export function translate(language: Language, key: MessageKey, vars?: TranslateVars): string {
  const primary = lookupMessage(dictionaries[language], key);
  const fallback = language === "en" ? undefined : lookupMessage(dictionaries.en, key);
  return interpolate(primary ?? fallback ?? key, vars);
}

export function displayCampaignTitle(
  language: Language,
  _slug: string,
  dbTitle: string,
  dbTitleHi?: string | null,
): string {
  return tValue(language, { en: dbTitle, hi: dbTitleHi });
}

export function dateLocale(language: Language) {
  return language === "hi" ? "hi-IN" : "en-IN";
}
