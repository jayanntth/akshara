import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { T, LOCALES, LANGUAGE_NAMES, LANGUAGE_SCRIPTS } from "./translations.js";

export { LOCALES, LANGUAGE_NAMES, LANGUAGE_SCRIPTS };

const UI_KEY = "akshara.uiLang";

const I18nContext = createContext(null);

/** Fills {name} style placeholders. */
function interpolate(text, vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
  );
}

export function I18nProvider({ children }) {
  const [uiLang, setUiLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(UI_KEY);
      return LOCALES.includes(saved) ? saved : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(UI_KEY, uiLang);
    } catch {
      /* private mode - the language simply will not persist */
    }
    // Keeps the document in step with the interface language, which matters for
    // screen readers and for the per-script font stacks in styles.css.
    document.documentElement.lang = uiLang;
    document.documentElement.dataset.script = uiLang;
  }, [uiLang]);

  const setUiLang = useCallback((next) => {
    if (LOCALES.includes(next)) setUiLangState(next);
  }, []);

  /**
   * t("dash.hello", { name: "Affan" })
   *
   * Falls back to English only if a key is genuinely absent from the table,
   * and shouts about it in development so the gap gets fixed rather than
   * quietly shipping an English label into a Kannada screen.
   */
  const t = useCallback(
    (key, vars) => {
      const row = T[key];
      if (!row) {
        if (import.meta.env.DEV) console.warn("[i18n] unknown key:", key);
        return key;
      }
      return interpolate(row[uiLang] || row.en, vars);
    },
    [uiLang]
  );

  const value = useMemo(() => ({ uiLang, setUiLang, t }), [uiLang, setUiLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

/**
 * The name of a language, always in its own script.
 * languageLabel("kn") is "ಕನ್ನಡ" whether the interface is English or Tamil.
 */
export function languageLabel(id) {
  return LANGUAGE_NAMES[id] || id;
}

export function scriptLabel(id) {
  return LANGUAGE_SCRIPTS[id] || "";
}
