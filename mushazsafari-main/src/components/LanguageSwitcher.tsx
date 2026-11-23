"use client";

import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  // "light" sits on the white scrolled bar, "dark" on the transparent hero band and the drawer.
  tone: "light" | "dark";
};

export function LanguageSwitcher({ tone }: LanguageSwitcherProps) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("nav.language")}
      className={cn(
        "flex h-8 items-center overflow-hidden rounded-full border transition-colors duration-500",
        tone === "light" ? "border-muted" : "border-white/20"
      )}
    >
      {(["en", "sw"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={cn(
            "h-full px-3 text-[9px] font-space font-bold uppercase tracking-[0.2em] transition-all duration-300",
            lang === code
              ? "bg-secondary text-white"
              : tone === "light"
                ? "text-muted-foreground hover:text-secondary"
                : "text-white/55 hover:text-secondary"
          )}
        >
          {code === "en" ? "EN" : "SW"}
        </button>
      ))}
    </div>
  );
}
