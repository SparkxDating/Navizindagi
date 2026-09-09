/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  readStoredLanguage,
  resolveInitialLanguage,
  tValue as resolveLocalizedValue,
  writeStoredLanguage,
} from "./core.ts";
import { translate, type TranslateFn } from "./messages.ts";
import { DEFAULT_LANGUAGE, type Language } from "./types.ts";

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslateFn;
  tValue: (parts: { en?: string | null; hi?: string | null }) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function applyDocumentLang(language: Language) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = language;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const stored = readStoredLanguage();
    const resolved = stored ?? resolveInitialLanguage();
    setLanguageState(resolved);
    if (!stored) writeStoredLanguage(resolved);
    applyDocumentLang(resolved);
  }, []);

  useEffect(() => {
    applyDocumentLang(language);
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    writeStoredLanguage(next);
    applyDocumentLang(next);
  }, []);

  const t = useCallback<TranslateFn>((key, vars) => translate(language, key, vars), [language]);

  const tValue = useCallback(
    (parts: { en?: string | null; hi?: string | null }) => resolveLocalizedValue(language, parts),
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, tValue }),
    [language, setLanguage, t, tValue],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLanguage() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

export function useTranslation() {
  return useLanguage();
}

export function useOptionalLanguage() {
  return useContext(I18nContext);
}

export function EnsureLanguage({ children }: { children: ReactNode }) {
  const existing = useOptionalLanguage();
  if (existing) return children;
  return <LanguageProvider>{children}</LanguageProvider>;
}

export function usePageSeo(title: string, description?: string) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = title;
    if (!description) return;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", description);
  }, [title, description]);
}
