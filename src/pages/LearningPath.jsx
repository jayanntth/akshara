import { useI18n } from "../i18n/index.jsx";
import { useApp } from "../context/AppContext.jsx";

/**
 * The weekly plan, sized from the two numbers Mira asked for: how many weeks,
 * and how many minutes a day. The phase mix shifts across the plan, and the
 * "you are here" marker runs off the start date rather than off completion,
 * so falling behind shows as falling behind.
 */
export default function LearningPath({ go }) {
  const { t } = useI18n();
  const { learner, path, position, refreshPath } = useApp();

  if (!path) return <div className="page"><p className="muted">{t("prog.none")}</p></div>;

  return (
    <div className="page path">
      <header className="page-head">
        <h1>{t("path.title")}</h1>
        <p className="muted">{t("path.sub", { weeks: path.weeks, mins: path.minutesPerDay })}</p>
      </header>

      <ol className="path-list">
        {path.plan.map((week) => {
          const here = week.week === position.week;
          const past = week.week < position.week;
          return (
            <li key={week.week} className={`path-week${here ? " here" : past ? " past" : ""}`}>
              <div className="path-week-head">
                <span className="week-no">
                  {t("c.week")} {week.week}
                </span>
                {here && <span className="chip small">{t("path.here")}</span>}
              </div>
              <p className="path-focus">
                <em>{t("path.focus")}:</em> {t(week.focusKey)}
              </p>
              <ul className="path-acts">
                {week.activities.map((a) => (
                  <li key={a.kind}>{t(a.key, { n: a.n })}</li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>

      <div className="path-tools">
        <button
          type="button"
          className="btn btn-quiet"
          onClick={refreshPath}
        >
          {t("path.rebuild")}
        </button>
        <button type="button" className="btn btn-primary" onClick={() => go("learn")}>
          {t("c.start")}
        </button>
      </div>

      <p className="muted small center">
        {t("prof.weeksLbl")}: {learner.weeks} {t("c.weeks")} &middot; {t("prof.dailyLbl")}:{" "}
        {learner.minutesPerDay} {t("c.min")}
      </p>
    </div>
  );
}
