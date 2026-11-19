"use client";
/**
 * PreferencesProvider.tsx - remembers the visitor's language and colour theme.
 *
 * "use client" means this code runs in the browser (it needs localStorage
 * and button clicks). Any component inside it can call usePrefs() to get:
 *   lang / setLang    - "en" or "bn"
 *   theme / setTheme  - one of the ids in lib/themes.ts
 *   t("key")          - the text for that key in the current language
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { dictionary, type Lang, type TextKey } from "@/lib/i18n";
import { DEFAULT_THEME, THEMES } from "@/lib/themes";

type Prefs = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  theme: string;
  setTheme: (theme: string) => void;
  t: (key: TextKey) => string;
};

const PrefsContext = createContext<Prefs | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [theme, setThemeState] = useState<string>(DEFAULT_THEME);

  // When the page first opens in the browser, load the choices saved last time.
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("sz-lang");
      const savedTheme = localStorage.getItem("sz-theme");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading saved choices once on load
      if (savedLang === "en" || savedLang === "bn") setLangState(savedLang);
      if (savedTheme && THEMES.some((th) => th.id === savedTheme)) setThemeState(savedTheme);
    } catch {
      // Private browsing can block localStorage; the defaults still work.
    }
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    document.documentElement.lang = next; // tells the browser (and screen readers) the language
    try {
      localStorage.setItem("sz-lang", next);
    } catch {}
  }

  function setTheme(next: string) {
    setThemeState(next);
    document.documentElement.dataset.theme = next; // globals.css switches colours on this
    try {
      localStorage.setItem("sz-theme", next);
    } catch {}
  }

  const t = (key: TextKey) => dictionary[lang][key];

  return (
    <PrefsContext.Provider value={{ lang, setLang, theme, setTheme, t }}>
      {children}
    </PrefsContext.Provider>
  );
}

export function usePrefs(): Prefs {
  const prefs = useContext(PrefsContext);
  if (!prefs) throw new Error("usePrefs() must be used inside <PreferencesProvider>");
  return prefs;
}
