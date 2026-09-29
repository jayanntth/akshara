import { useMemo, useState } from "react";
import { useI18n, languageLabel } from "../i18n/index.jsx";
import { useApp } from "../context/AppContext.jsx";
import { getGeneratedLesson, getRecommendations } from "../api/learningPathApi.js";
import { levelFor } from "../data/languages.js";
import SkillBar, { StatCard } from "../components/SkillBar.jsx";
import Teacher from "../components/Teacher.jsx";

/**
 * The dashboard is where the onboarding answers have to visibly pay off
 * (change #1). Every block on this screen is shaped by something Mira asked:
 * the greeting language, the script, the daily minute goal, the plan length,
 * and the reason for learning, which weights what gets recommended.
 */
export default function Dashboard({ go }) {
  const { t, uiLang } = useI18n();
  const { learner, prediction, stats, position } = useApp();
  const [lessonSeed, setLessonSeed] = useState(0);

  const recommendations = useMemo(
    () => getRecommendations(learner, prediction, 4),
    [learner, prediction]
  );

  const lesson = useMemo(
    () => (lessonSeed ? getGeneratedLesson(learner, prediction, lessonSeed) : null),
    [learner, prediction, lessonSeed]
  );

  const level = levelFor(learner.letters.length);
  const goal = learner.minutesPerDay || 10;
  const metGoal = stats.minutesToday >= goal;

  return (
    <div className="page dash">
      <section className="dash-head card">
        <Teacher mood={metGoal ? "cheer" : "smile"} size={72} />
        <div>
          <h1>{t("dash.hello", { name: learner.name })}</h1>
          <p className="muted">{t("dash.sub")}</p>
        </div>
        <button type="button" className="chip chip-plan" onClick={() => go("path")}>
          {t("dash.planCard", { a: position.week, b: position.total })}
        </button>
      </section>

      <section className="stats">
        <StatCard label={t("dash.streak")} value={stats.streak} sub={t("c.days")} />
        <StatCard label={t("dash.letters")} value={`${learner.letters.length}/20`} />
        <StatCard label={t("dash.levelLbl")} value={t(level.key)} />
        <StatCard label={t("dash.xpLbl")} value={stats.xp} sub={t("c.xp")} />
      </section>

      <section className="card goal-card">
        <div className="goal-head">
          <h2>{t("dash.goalToday")}</h2>
          <span className="muted">{t("dash.minsToday", { a: stats.minutesToday, b: goal })}</span>
        </div>
        <div className="goal-track">
          <span
            className="goal-fill"
            style={{ width: `${Math.min(100, Math.round((stats.minutesToday / goal) * 100))}%` }}
          />
        </div>
        {metGoal && <p className="goal-met">{t("dash.goalMet")}</p>}
      </section>

      <div className="dash-grid">
        <section className="card">
          <h2>{t("dash.nextUp")}</h2>
          {recommendations.length === 0 ? (
            <p className="muted">{t("dash.noReco")}</p>
          ) : (
            <ul className="reco-list">
              {recommendations.map((r) => (
                <li key={r.id}>
                  <button type="button" className="reco" onClick={() => openRecommendation(r, go)}>
                    <span className="reco-kind">{t(actionKey(r))}</span>
                    <span className="reco-title">{recoTitle(r, uiLang, t)}</span>
                    <span className="reco-why">
                      <em>{t("dash.why")}:</em> {t(r.reasonKey, resolveVars(r.reasonVars, t))}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2>{t("dash.skills")}</h2>
          <p className="muted small">
            {t("dash.predicted")}: <strong>{Math.round(prediction.overall * 100)}%</strong> &middot;{" "}
            {t("dash.confidence", { n: Math.round(prediction.confidence * 100) })}
          </p>
          <div className="skills">
            {Object.entries(prediction.skills).map(([skill, s]) => (
              <SkillBar key={skill} skill={skill} value={s.estimate} confidence={s.confidence} />
            ))}
          </div>
        </section>
      </div>

      <section className="card lesson-card">
        <div className="goal-head">
          <h2>{t("gen.title")}</h2>
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={() => setLessonSeed((s) => s + 1)}
          >
            {lesson ? t("gen.again") : t("gen.make")}
          </button>
        </div>

        {lesson ? (
          <>
            <p className="muted">
              {t("gen.sub", { skill: t(`skill.${lesson.focusSkill}`), mins: lesson.minutes })}
            </p>
            <ol className="lesson-steps">
              {lesson.steps.map((step) => (
                <li key={step.id}>
                  <strong>{t(step.titleKey)}</strong>
                  <span>{describeStep(step, uiLang)}</span>
                  {step.kind === "revision" && <em className="muted small">{t("gen.revision")}</em>}
                </li>
              ))}
            </ol>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const story = lesson.steps.find((s) => s.story)?.story;
                go("learn", story ? { storyId: story.id } : undefined);
              }}
            >
              {t("c.start")}
            </button>
          </>
        ) : (
          <p className="muted">
            {t("gen.sub", { skill: t(`skill.${bestGuessSkill(prediction)}`), mins: learner.minutesPerDay || 10 })}
          </p>
        )}
      </section>

      <p className="muted small center">
        {t("prof.learnLang")}: <span lang={learner.langId}>{languageLabel(learner.langId)}</span>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ helpers */

function actionKey(r) {
  return { story: "reco.a.story", letters: "reco.a.letters", assess: "reco.a.assess", speak: "reco.a.speak" }[r.kind];
}

function recoTitle(r, uiLang, t) {
  if (r.kind === "story") return r.payload.story.gist[uiLang] || r.payload.story.title;
  if (r.kind === "assess") return t(`skill.${r.payload.type}`);
  if (r.kind === "letters") return t("learn.tabLetters");
  return t("learn.tabSpeak");
}

/** Reason strings carry translation keys inside their variables, not text. */
function resolveVars(vars, t) {
  if (!vars) return null;
  const out = {};
  for (const [k, v] of Object.entries(vars)) {
    out[k] = typeof v === "string" && v.includes(".") ? t(v) : v;
  }
  return out;
}

function openRecommendation(r, go) {
  if (r.kind === "story") go("learn", { storyId: r.payload.story.id });
  else if (r.kind === "letters") go("learn", { tab: "letters" });
  else if (r.kind === "speak") go("learn", { tab: "speak" });
  else go("assess", { type: r.payload.type });
}

function describeStep(step, uiLang) {
  if (step.kind === "letters") return step.letters.map((l) => l.g).join("  ");
  if (step.kind === "story" || step.kind === "questions") return step.story?.title || "";
  if (step.kind === "revision") return step.revision?.q || step.story?.title || "";
  if (step.kind === "speak") return step.line;
  return "";
}

function bestGuessSkill(prediction) {
  return Object.entries(prediction.skills).sort((a, b) => a[1].estimate - b[1].estimate)[0][0];
}
