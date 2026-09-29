import { useEffect, useMemo, useState } from "react";
import Teacher from "./Teacher.jsx";
import { useI18n, LOCALES, languageLabel, scriptLabel } from "../i18n/index.jsx";

/**
 * The popup Mira opens the first time a learner signs in (change #1).
 *
 * Six questions, one per screen. The first question switches the interface
 * language immediately on selection, so the remaining five are already in the
 * learner's own language - which is the point of asking it first.
 *
 * Every answer feeds something real: uiLang drives the interface, langId picks
 * the content, knowledge seeds the proficiency prior, weeks and minutes size
 * the learning path, goal weights story selection, style orders the daily plan.
 */

const STEPS = [
  { id: "uiLang",       kind: "language", titleKey: "ob.qUi",    helpKey: "ob.qUiHelp",    mood: "smile" },
  { id: "langId",       kind: "language", titleKey: "ob.qLearn", helpKey: "ob.qLearnHelp", mood: "smile" },
  {
    id: "knowledge", kind: "choice", titleKey: "ob.qKnow", helpKey: "ob.qKnowHelp", mood: "think",
    options: [
      { value: "none",    labelKey: "ob.know.none" },
      { value: "letters", labelKey: "ob.know.letters" },
      { value: "slow",    labelKey: "ob.know.slow" },
      { value: "good",    labelKey: "ob.know.good" },
    ],
  },
  {
    id: "weeks", kind: "choice", titleKey: "ob.qWeeks", helpKey: "ob.qWeeksHelp", mood: "think",
    options: [
      { value: 2,  label: "2" },
      { value: 4,  label: "4" },
      { value: 8,  label: "8" },
      { value: 12, label: "12" },
    ],
    suffixKey: "c.weeks",
  },
  {
    id: "minutesPerDay", kind: "choice", titleKey: "ob.qDaily", helpKey: "ob.qDailyHelp", mood: "think",
    options: [
      { value: 5,  label: "5" },
      { value: 10, label: "10" },
      { value: 20, label: "20" },
      { value: 30, label: "30" },
    ],
    suffixKey: "c.min",
  },
  {
    id: "goal", kind: "choice", titleKey: "ob.qGoal", helpKey: "ob.qGoalHelp", mood: "smile",
    options: [
      { value: "work",   labelKey: "ob.goal.work" },
      { value: "school", labelKey: "ob.goal.school" },
      { value: "family", labelKey: "ob.goal.family" },
      { value: "travel", labelKey: "ob.goal.travel" },
      { value: "self",   labelKey: "ob.goal.self" },
    ],
  },
  {
    id: "style", kind: "choice", titleKey: "ob.qStyle", helpKey: "ob.qStyleHelp", mood: "smile",
    options: [
      { value: "stories",  labelKey: "ob.style.stories" },
      { value: "letters",  labelKey: "ob.style.letters" },
      { value: "speaking", labelKey: "ob.style.speaking" },
      { value: "writing",  labelKey: "ob.style.writing" },
    ],
  },
];

/** Which questions still need asking, given what the login screen collected. */
function stepsFor(initial) {
  // v3: both languages are chosen on the login screen now, so Mira only asks
  // them if they somehow arrive empty (an account from before v3, say).
  const haveLanguages = Boolean(initial?.uiLang && initial?.langId);
  return haveLanguages ? STEPS.filter((s) => s.kind !== "language") : STEPS;
}

export default function TeacherOnboarding({ open, onFinish, initial }) {
  const { t, uiLang, setUiLang } = useI18n();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(() => ({ uiLang, langId: null, ...initial }));
  const [done, setDone] = useState(false);
  const [steps, setSteps] = useState(() => stepsFor(initial));

  useEffect(() => {
    if (open) {
      setStep(0);
      setDone(false);
      setSteps(stepsFor(initial));
      setAnswers({ uiLang, langId: null, ...initial, uiLang: initial?.uiLang || uiLang });
    }
    // uiLang is deliberately not a dependency: re-running on language change
    // would throw the learner back to question one mid-flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const current = steps[step];
  const levelName = useMemo(() => {
    const map = { none: "lvl.1", letters: "lvl.1", slow: "lvl.2", good: "lvl.3" };
    return t(map[answers.knowledge] || "lvl.1");
  }, [answers.knowledge, t]);

  if (!open) return null;

  function choose(value) {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);

    // Switching the interface language here, not at the end, so the learner
    // sees the rest of the questions in the language they just picked.
    if (current.id === "uiLang") setUiLang(value);

    if (step + 1 < steps.length) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  }

  function finish() {
    onFinish({
      ...answers,
      // If someone somehow skips the script question, learn the script of the
      // language they are reading the interface in.
      langId: answers.langId || answers.uiLang || "hi",
    });
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={t("ob.hello")}>
      <div className="modal onboarding">
        {done ? (
          <div className="ob-done">
            <Teacher mood="cheer" size={110} />
            <h2>{t("ob.doneTitle")}</h2>
            <p className="ob-done-line">
              {t("ob.doneMsg", {
                weeks: answers.weeks,
                mins: answers.minutesPerDay,
                lvl: levelName,
              })}
            </p>
            <button type="button" className="btn btn-primary btn-wide" onClick={finish}>
              {t("ob.goDash")}
            </button>
          </div>
        ) : (
          <>
            <div className="ob-head">
              <Teacher mood={current.mood} size={84} />
              <div className="ob-bubble">
                <p className="ob-hello">
                  {step === 0 ? t("ob.hello") : t("ob.teacher")}
                </p>
                <h2 className="ob-question">{t(current.titleKey)}</h2>
                <p className="ob-help">{t(current.helpKey)}</p>
              </div>
            </div>

            <div className="ob-progress" aria-hidden="true">
              {steps.map((s, i) => (
                <span key={s.id} className={i <= step ? "pip on" : "pip"} />
              ))}
            </div>
            <p className="ob-step">{t("ob.step", { a: step + 1, b: steps.length })}</p>

            {current.kind === "language" ? (
              <div className="ob-options lang-grid">
                {LOCALES.map((code) => (
                  <button
                    type="button"
                    key={code}
                    className={`ob-option lang-option${answers[current.id] === code ? " selected" : ""}`}
                    onClick={() => choose(code)}
                    lang={code}
                  >
                    {/* Always the endonym, never a translation of it. */}
                    <span className="lang-name">{languageLabel(code)}</span>
                    <span className="lang-script">{scriptLabel(code)}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="ob-options">
                {current.options.map((opt) => (
                  <button
                    type="button"
                    key={String(opt.value)}
                    className={`ob-option${answers[current.id] === opt.value ? " selected" : ""}`}
                    onClick={() => choose(opt.value)}
                  >
                    {opt.labelKey ? t(opt.labelKey) : `${opt.label} ${t(current.suffixKey)}`}
                  </button>
                ))}
              </div>
            )}

            {step > 0 && (
              <button type="button" className="btn btn-quiet ob-back" onClick={() => setStep(step - 1)}>
                {t("c.back")}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
