import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, type Language, type NestedMessages } from "./types.ts";

export function isLanguage(value: unknown): value is Language {
  return value === "en" || value === "hi";
}

export function readStoredLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  try {
    return isLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY))
      ? (window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language)
      : null;
  } catch {
    return null;
  }
}

export function writeStoredLanguage(language: Language) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    /* ignore quota / private mode */
  }
}

export function detectBrowserLanguage(): Language {
  if (typeof navigator === "undefined") return DEFAULT_LANGUAGE;
  const tag = (navigator.language || "").toLowerCase();
  return tag.startsWith("hi") ? "hi" : DEFAULT_LANGUAGE;
}

export function resolveInitialLanguage(): Language {
  return readStoredLanguage() ?? detectBrowserLanguage();
}

export function lookupMessage(messages: NestedMessages, path: string): string | undefined {
  const parts = path.split(".");
  let current: string | NestedMessages | undefined = messages;
  for (const part of parts) {
    if (!current || typeof current === "string") return undefined;
    current = current[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    vars[key] == null ? match : String(vars[key]),
  );
}

export function tValue(
  language: Language,
  parts: { en?: string | null; hi?: string | null },
): string {
  const en = parts.en?.trim() ?? "";
  const hi = parts.hi?.trim() ?? "";
  if (language === "hi") return hi || en;
  return en || hi;
}

export function collectLeaves(messages: NestedMessages, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") keys.push(path);
    else keys.push(...collectLeaves(value, path));
  }
  return keys.sort();
}
