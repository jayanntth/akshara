import { useEffect, useRef, useState } from "react";
import { useI18n, LOCALES, languageLabel, scriptLabel } from "../i18n/index.jsx";

/**
 * Interface language switcher (changes #4 and #5).
 *
 * The one rule this component exists to enforce: a language is always named in
 * its own script. "ಕನ್ನಡ" stays "ಕನ್ನಡ" whether the interface is English,
 * Tamil or Bengali - it is never rendered as "Kannada" or "ಕನ್ನಡ ಭಾಷೆ" or
 * "ಇಂಗ್ಲಿಷ್". A learner who cannot yet read the current interface language can
 * still find their way home, which is the whole point of a language switcher.
 *
 * Consequently `languageLabel()` takes no locale argument. There is no way to
 * ask it for a translated name, so the bug cannot come back by accident.
 */
export default function LanguageSwitcher({ compact = false }) {
  const { uiLang, setUiLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className={`lang-switch${compact ? " compact" : ""}`} ref={wrapRef}>
      <button
        type="button"
        className="lang-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        /* The word "Language" is the only label here that follows the
           interface. The names inside the menu never do. */
        title={t("app.switchLang")}
      >
        <GlobeIcon />
        <span className="lang-current" lang={uiLang}>
          {languageLabel(uiLang)}
        </span>
        <span className="caret" aria-hidden="true" />
      </button>

      {open && (
        <ul className="lang-menu" role="listbox" aria-label={t("app.switchLang")}>
          {LOCALES.map((code) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-selected={code === uiLang}
                lang={code}
                className={`lang-item${code === uiLang ? " active" : ""}`}
                onClick={() => {
                  setUiLang(code);
                  setOpen(false);
                }}
              >
                <span className="lang-name">{languageLabel(code)}</span>
                <span className="lang-script">{scriptLabel(code)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" className="globe">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}
