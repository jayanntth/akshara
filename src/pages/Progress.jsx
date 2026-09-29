import { useMemo } from "react";
import { useI18n } from "../i18n/index.jsx";
import { useApp } from "../context/AppContext.jsx";
import { getReport } from "../api/learningPathApi.js";
import SkillBar, { StatCard } from "../components/SkillBar.jsx";

/**
 * Learning report and improvement recommendations.
 *
 * Three questions, in order: what did I do this week, is it working, and what
 * should I fix. The advice list is keyed off the weakest skill and the amount
 * of evidence behind the prediction, so a learner with almost no record is
 * told to go and make some rather than handed a confident-sounding diagnosis.
 */
export default function Progress() {
  const { t } = useI18n();
  const { learner, prediction } = useApp();
  const report = useMemo(() => getReport(learner, prediction), [learner, prediction]);

  const trendKey = {
    up: "prog.trendUp",
    flat: "prog.trendFlat",
    down: "prog.trendDown",
  }[report.direction];

  return (
    <div className="page progress">
      <header className="page-head">
        <h1>{t("prog.title")}</h1>
        <p className="muted">{t("prog.sub")}</p>
      </header>

      <h2 className="section-label">{t("prog.week")}</h2>
      <section className="stats">
        <StatCard label={t("prog.stories")} value={report.week.stories} />
        <StatCard label={t("prog.assess")} value={report.week.assessments} />
        <StatCard label={t("learn.tabSpeak")} value={report.week.speech} />
        <StatCard label={t("c.min")} value={report.week.minutes} />
      </section>

      <div className="dash-grid">
        <section className="card">
          <h2>{t("dash.skills")}</h2>
          <div className="skills">
            {report.skillBars.map((s) => (
              <SkillBar key={s.skill} skill={s.skill} value={s.value} confidence={s.confidence} />
            ))}
          </div>
        </section>

        <section className="card">
          <h2>{t("prog.advice")}</h2>
          <ul className="kv">
            <li>
              <span>{t("prog.strong")}</span>
              <strong>{report.strong ? t(`skill.${report.strong}`) : "—"}</strong>
            </li>
            <li>
              <span>{t("prog.weak")}</span>
              <strong>{report.weak ? t(`skill.${report.weak}`) : "—"}</strong>
            </li>
            <li>
              <span>{t("prog.title")}</span>
              <strong className={`trend ${report.direction}`}>{t(trendKey)}</strong>
            </li>
          </ul>

          <ul className="advice">
            {report.advice.map((a) => (
              <li key={a.key}>{t(a.key)}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
