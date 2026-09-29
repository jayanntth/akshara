import { useState } from "react";
import { useI18n, LOCALES, languageLabel, scriptLabel } from "../i18n/index.jsx";
import { useApp } from "../context/AppContext.jsx";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";

const KNOW_KEYS = {
  none: "ob.know.none",
  letters: "ob.know.letters",
  slow: "ob.know.slow",
  good: "ob.know.good",
};

const GOAL_KEYS = {
  work: "ob.goal.work",
  school: "ob.goal.school",
  family: "ob.goal.family",
  travel: "ob.goal.travel",
  self: "ob.goal.self",
};

export default function Profile() {
  const { t } = useI18n();
  const { learner, patchLearner, resetOnboarding } = useApp();
  const [saved, setSaved] = useState(false);

  function setScript(code) {
    // Changing the script changes the plan signature, so the learning path
    // rebuilds itself - no need to poke it from here with a stale learner.
    patchLearner({ langId: code });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div className="page profile">
      <header className="page-head">
        <h1>{t("prof.title")}</h1>
      </header>

      <section className="card">
        <h2>{t("prof.account")}</h2>
        <ul className="kv">
          <li>
            <span>{t("auth.name")}</span>
            <strong>{learner.name}</strong>
          </li>
          <li>
            <span>{t("auth.email")}</span>
            <strong>{learner.email}</strong>
          </li>
        </ul>
      </section>

      <section className="card">
        <h2>{t("prof.prefs")}</h2>

        <div className="pref-row">
          <span>{t("prof.uiLang")}</span>
          <LanguageSwitcher compact />
        </div>

        <div className="pref-block">
          <span className="pref-label">{t("prof.learnLang")}</span>
          <div className="ob-options lang-grid">
            {LOCALES.map((code) => (
              <button
                type="button"
                key={code}
                lang={code}
                className={`ob-option lang-option${learner.langId === code ? " selected" : ""}`}
                onClick={() => setScript(code)}
              >
                {/* Endonyms here as well - a script is named in its own script. */}
                <span className="lang-name">{languageLabel(code)}</span>
                <span className="lang-script">{scriptLabel(code)}</span>
              </button>
            ))}
          </div>
        </div>

        <ul className="kv">
          <li>
            <span>{t("prof.weeksLbl")}</span>
            <strong>
              {learner.weeks} {t("c.weeks")}
            </strong>
          </li>
          <li>
            <span>{t("prof.dailyLbl")}</span>
            <strong>
              {learner.minutesPerDay} {t("c.min")}
            </strong>
          </li>
          <li>
            <span>{t("prof.goalLbl")}</span>
            <strong>{learner.goal ? t(GOAL_KEYS[learner.goal]) : "—"}</strong>
          </li>
          <li>
            <span>{t("prof.knowLbl")}</span>
            <strong>{learner.knowledge ? t(KNOW_KEYS[learner.knowledge]) : "—"}</strong>
          </li>
        </ul>

        {saved && <p className="saved">{t("prof.saved")}</p>}

        {/* Everything above came from Mira's popup, so the way to change it in
            bulk is to reopen the popup rather than to rebuild it as a form. */}
        <button type="button" className="btn btn-primary btn-wide" onClick={resetOnboarding}>
          {t("prof.redo")}
        </button>
      </section>
    </div>
  );
}
