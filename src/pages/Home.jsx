import { useI18n, LOCALES, languageLabel } from "../i18n/index.jsx";
import Teacher from "../components/Teacher.jsx";

export default function Home({ go }) {
  const { t } = useI18n();

  const features = [
    { t: "home.f1t", d: "home.f1d" },
    { t: "home.f2t", d: "home.f2d" },
    { t: "home.f3t", d: "home.f3d" },
  ];

  return (
    <div className="page home">
      <section className="hero">
        <div className="hero-copy">
          <h1>{t("home.title")}</h1>
          <p>{t("home.sub")}</p>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => go("auth")}>
            {t("home.cta")}
          </button>

          {/* Endonyms here too - the landing page is the first place a learner
              who cannot read English needs to recognise their own language. */}
          <ul className="hero-langs">
            {LOCALES.map((code) => (
              <li key={code} lang={code}>
                {languageLabel(code)}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="hero-card">
            <Teacher mood="smile" size={132} />
            <div className="hero-letters">
              <span>अ</span>
              <span>ಅ</span>
              <span>அ</span>
              <span>అ</span>
              <span>অ</span>
              <span>A</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        {features.map((f) => (
          <article className="feature" key={f.t}>
            <h3>{t(f.t)}</h3>
            <p>{t(f.d)}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
