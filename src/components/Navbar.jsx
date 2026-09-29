import { useState } from "react";
import { useI18n } from "../i18n/index.jsx";
import { useApp } from "../context/AppContext.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

/**
 * Top navigation.
 *
 * Change #2: there is no Voice Studio entry, and no Voice Studio route behind
 * one. Speaking practice has not been dropped - it now lives inside Learn and
 * practise as the "Say it" tab, next to the material being practised, which is
 * where a learner looks for it anyway.
 */
const ITEMS = [
  { id: "dashboard", key: "nav.dashboard" },
  { id: "learn", key: "nav.learn" },
  { id: "assess", key: "nav.assess" },
  { id: "path", key: "nav.path" },
  { id: "progress", key: "nav.progress" },
  { id: "badges", key: "nav.badges" },
  { id: "profile", key: "nav.profile" },
];

export default function Navbar({ route, go }) {
  const { t } = useI18n();
  const { user, logout } = useApp();
  const [open, setOpen] = useState(false);

  const navigate = (id) => {
    setOpen(false);
    go(id);
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <button type="button" className="brand" onClick={() => navigate(user ? "dashboard" : "home")}>
          <BrandMark />
          <span className="brand-text">
            <strong>Akshara</strong>
            <em>{t("app.tagline")}</em>
          </span>
        </button>

        {user && (
          <button
            type="button"
            className={`burger${open ? " open" : ""}`}
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <span />
            <span />
            <span />
          </button>
        )}

        <nav className={`nav-links${open ? " open" : ""}`}>
          {user ? (
            <>
              {ITEMS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`nav-link${route === item.id ? " active" : ""}`}
                  onClick={() => navigate(item.id)}
                >
                  {t(item.key)}
                </button>
              ))}
              <div className="nav-right">
                <LanguageSwitcher />
                <button
                  type="button"
                  className="btn btn-quiet btn-sm"
                  onClick={() => {
                    setOpen(false);
                    logout();
                    go("home");
                  }}
                >
                  {t("nav.logout")}
                </button>
              </div>
            </>
          ) : (
            <div className="nav-right">
              <LanguageSwitcher />
              <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate("auth")}>
                {t("nav.login")}
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function BrandMark() {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true" className="brand-mark">
      <rect x="1.5" y="1.5" width="37" height="37" rx="9" fill="#2F4538" />
      <path d="M12 27 L20 12 L28 27" fill="none" stroke="#E0A339" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 22 h9" fill="none" stroke="#F5F1E6" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
