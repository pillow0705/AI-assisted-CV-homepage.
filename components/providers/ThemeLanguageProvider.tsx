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

type Theme = "light" | "dark";

interface Ctx {
  theme: Theme;
  toggleTheme: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: UIStrings;
}

const ThemeLanguageContext = createContext<Ctx | null>(null);

export function ThemeLanguageProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLangState] = useState<Lang>("en");

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as Theme | null) ?? "light";
    const savedLang = (localStorage.getItem("lang") as Lang | null) ?? "en";
    setTheme(savedTheme);
    setLangState(savedLang);
  }, []);

  // Reflect theme on <html> so CSS variables switch.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang === "cn" ? "zh" : "en");
    localStorage.setItem("lang", lang);
  }, [lang]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "light" ? "dark" : "light")),
    []
  );
  const setLang = useCallback((l: Lang) => setLangState(l), []);

  return (
    <ThemeLanguageContext.Provider
      value={{ theme, toggleTheme, lang, setLang, t: STRINGS[lang] }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
}

export function useUI(): Ctx {
  const ctx = useContext(ThemeLanguageContext);
  if (!ctx) throw new Error("useUI must be used within ThemeLanguageProvider");
  return ctx;
}
