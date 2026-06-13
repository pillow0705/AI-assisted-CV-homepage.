"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { STRINGS, type Lang, type UIStrings } from "@/lib/i18n";

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: UIStrings;
}

const ThemeLanguageContext = createContext<Ctx | null>(null);

export function ThemeLanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Hydrate language from localStorage once on mount.
  useEffect(() => {
    const savedLang = (localStorage.getItem("lang") as Lang | null) ?? "en";
    setLangState(savedLang);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang === "cn" ? "zh" : "en");
    localStorage.setItem("lang", lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  return (
    <ThemeLanguageContext.Provider value={{ lang, setLang, t: STRINGS[lang] }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
}

export function useUI(): Ctx {
  const ctx = useContext(ThemeLanguageContext);
  if (!ctx) throw new Error("useUI must be used within ThemeLanguageProvider");
  return ctx;
}
