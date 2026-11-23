"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STRINGS } from "@/lib/i18n";

export type SiteLanguage = "en" | "sw";

type LanguageContextValue = {
  lang: SiteLanguage;
  setLang: (lang: SiteLanguage) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "miale-lang";

export function SiteLanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<SiteLanguage>("en");

  // The stored preference is applied after mount so the prerendered HTML
  // (English) and the hydrated page always agree.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "sw" || saved === "en") setLangState(saved);
    } catch {
      // localStorage unavailable; English stays.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: SiteLanguage) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Preference cannot persist; the session keeps the chosen language.
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let value = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
      if (vars) {
        for (const [name, replacement] of Object.entries(vars)) {
          value = value.replaceAll(`{${name}}`, String(replacement));
        }
      }
      return value;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within SiteLanguageProvider");
  return ctx;
}
