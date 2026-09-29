import { useState } from "react";
import { useI18n, LOCALES, languageLabel, scriptLabel } from "../i18n/index.jsx";
import { useApp } from "../context/AppContext.jsx";
import { load, save } from "../api/storage.js";
import Teacher from "../components/Teacher.jsx";

const PICK_KEY = "akshara.pick";

/**
 * Sign-in, in two steps (v3 change #1).
 *
 * Step one asks the two questions everything else depends on - which language
 * the app should speak, and which language the learner wants to read - before
 * any form appears. Picking the app language switches the interface on the
 * spot, so the sign-in form that follows is already in that language.
 *
 * The last choice is remembered on this device, so a returning learner sees
 * both already selected and is one tap from the form.
 */
export default function Auth({ go }) {
  const { t, uiLang, setUiLang } = useI18n();
  const { login, register } = useApp();

  const remembered = load(PICK_KEY, null) || {};
  const [stage, setStage] = useState("pick");
  const [appLang, setAppLang] = useState(remembered.uiLang || uiLang);
  const [learnLang, setLearnLang] = useState(remembered.langId || null);
  const [pickError, setPickError] = useState(false);

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function chooseAppLang(code) {
    setAppLang(code);
    setUiLang(code);
    setPickError(false);
  }

  function continueToForm() {
    if (!appLang || !learnLang) {
      setPickError(true);
      return;
    }
    save(PICK_KEY, { uiLang: appLang, langId: learnLang });
    setStage("form");
  }

  function submit() {
    const email = form.email.trim();
    const password = form.password;
    if (!email || password.length < 4 || (mode === "register" && !form.name.trim())) {
      setError("auth.errFill");
      return;
    }
    const langs = { uiLang: appLang, langId: learnLang };
    const result =
      mode === "register"
        ? register({ name: form.name.trim(), email, password, ...langs })
        : login({ email, password, ...langs });

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    go("dashboard");
  }

  /* ------------------------------------------------ step 1: languages */
  if (stage === "pick") {
    return (
      <div className="page auth auth-pick">
        <div className="card auth-card">
          <div className="pick-head">
            <Teacher mood="smile" size={72} />
            <div>
              <h1>{t("auth.pickTitle")}</h1>
              <p className="muted">{t("auth.pickSub")}</p>
            </div>
          </div>

          <h2 className="section-label">{t("auth.uiLangQ")}</h2>
          <LangGrid value={appLang} onPick={chooseAppLang} />

          <h2 className="section-label">{t("auth.learnLangQ")}</h2>
          <LangGrid
            value={learnLang}
            onPick={(code) => {
              setLearnLang(code);
              setPickError(false);
            }}
          />

          {pickError && <p className="error">{t("auth.pickBoth")}</p>}

          <button
            type="button"
            className="btn btn-primary btn-wide"
            onClick={continueToForm}
            disabled={!appLang || !learnLang}
          >
            {t("c.continue")}
          </button>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------- step 2: form */
  return (
    <div className="page auth">
      <div className="card auth-card">
        <div className="lang-summary">
          <span className="chip" lang={learnLang}>
            {t("auth.learning", { lang: languageLabel(learnLang) })}
          </span>
          <button type="button" className="link-btn" onClick={() => setStage("pick")}>
            {t("auth.changeLang")}
          </button>
        </div>

        <h1>{mode === "login" ? t("auth.welcomeBack") : t("auth.createAcc")}</h1>
        <p className="muted">{t("auth.getStarted")}</p>

        <div className="fields">
          {mode === "register" && (
            <label className="field">
              <span>{t("auth.name")}</span>
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                autoComplete="name"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </label>
          )}

          <label className="field">
            <span>{t("auth.email")}</span>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </label>

          <label className="field">
            <span>{t("auth.password")}</span>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </label>
        </div>

        {error && <p className="error">{t(error)}</p>}

        <button type="button" className="btn btn-primary btn-wide" onClick={submit}>
          {mode === "login" ? t("nav.login") : t("auth.createAcc")}
        </button>

        <button
          type="button"
          className="btn btn-quiet btn-wide"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
          }}
        >
          {mode === "login" ? t("auth.newHere") : t("auth.haveAcc")}
        </button>
      </div>
    </div>
  );
}

/** Six languages, each named in its own script. */
function LangGrid({ value, onPick }) {
  return (
    <div className="ob-options lang-grid">
      {LOCALES.map((code) => (
        <button
          type="button"
          key={code}
          lang={code}
          className={`ob-option lang-option${value === code ? " selected" : ""}`}
          onClick={() => onPick(code)}
          aria-pressed={value === code}
        >
          <span className="lang-name">{languageLabel(code)}</span>
          <span className="lang-script">{scriptLabel(code)}</span>
        </button>
      ))}
    </div>
  );
}
