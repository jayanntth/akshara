import { useMemo, useState } from "react";
import { useI18n } from "../i18n/index.jsx";
import { useApp } from "../context/AppContext.jsx";
import { useSpeech } from "../hooks/useSpeech.js";
import { XP } from "../engine/gamification.js";
import Teacher from "./Teacher.jsx";

/**
 * A micro-story and the three questions that go with it (change #3).
 *
 * Reading runs in three beats: read it, hear it, answer it. The questions are
 * written in the story's own language on purpose - answering a Kannada
 * question about a Kannada story is the comprehension practice, not an
 * obstacle to it - while the one-line gist beside the title stays in the
 * learner's interface language so nobody is ever stranded.
 *
 * Wrong answers are recorded, not just counted: the generated lesson pulls
 * missed questions back in later, so a mistake becomes tomorrow's revision.
 */
export default function StoryReader({ story, onExit }) {
  const { t, uiLang } = useI18n();
  const { recordStoryRun } = useApp();
  const { speak, speaking, stopSpeaking, hasVoiceFor } = useSpeech();

  const [phase, setPhase] = useState("read"); // read | quiz | done
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [wrong, setWrong] = useState([]);
  const [correct, setCorrect] = useState(0);
  const [showRoman, setShowRoman] = useState(true);

  const voiceAvailable = useMemo(() => hasVoiceFor(story.lang), [hasVoiceFor, story.lang]);
  const question = story.questions[index];

  function readAloud() {
    if (speaking) {
      stopSpeaking();
      return;
    }
    speak(story.text.join(" "), story.lang, { rate: 0.8 });
  }

  function answer(optionIndex) {
    if (picked !== null) return;
    setPicked(optionIndex);
    const isRight = optionIndex === question.answer;
    if (isRight) setCorrect((c) => c + 1);
    else setWrong((w) => [...w, { q: question.q, correct: question.options[question.answer] }]);
  }

  function next() {
    if (index + 1 < story.questions.length) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    const finalCorrect = correct;
    recordStoryRun({
      storyId: story.id,
      correct: finalCorrect,
      total: story.questions.length,
      wrong,
      minutes: story.minutes,
      listened: voiceAvailable,
      level: story.level,
    });
    setPhase("done");
  }

  const earnedXp = XP.storyComplete + correct * XP.storyQuestion;

  /* ------------------------------------------------------------------ done */
  if (phase === "done") {
    return (
      <div className="card story-done">
        <Teacher mood="cheer" size={96} />
        <h2>{t("learn.complete")}</h2>
        <p className="score-line">
          {t("c.score")}: {correct} {t("c.of")} {story.questions.length}
        </p>
        <p className="xp-line">{t("learn.earned", { n: earnedXp })}</p>
        <button type="button" className="btn btn-primary btn-wide" onClick={onExit}>
          {t("learn.another")}
        </button>
      </div>
    );
  }

  /* ------------------------------------------------------------------ quiz */
  if (phase === "quiz") {
    return (
      <div className="card story-quiz">
        <p className="muted small">{t("learn.qOf", { a: index + 1, b: story.questions.length })}</p>
        <h2 className="q-text" lang={story.lang}>
          {question.q}
        </h2>

        <div className="options">
          {question.options.map((opt, i) => {
            const state =
              picked === null
                ? ""
                : i === question.answer
                ? " right"
                : i === picked
                ? " wrong"
                : " dim";
            return (
              <button
                type="button"
                key={opt}
                className={`option${state}`}
                lang={story.lang}
                onClick={() => answer(i)}
                disabled={picked !== null}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <>
            <p className={picked === question.answer ? "verdict right" : "verdict wrong"}>
              {picked === question.answer ? t("c.correct") : t("c.wrong")}
            </p>
            <button type="button" className="btn btn-primary btn-wide" onClick={next}>
              {index + 1 < story.questions.length ? t("c.next") : t("c.finish")}
            </button>
          </>
        )}
      </div>
    );
  }

  /* ------------------------------------------------------------------ read */
  return (
    <div className="card story-read">
      <div className="story-head">
        <div>
          <h2 lang={story.lang}>{story.title}</h2>
          {/* The bridge line: always in the learner's interface language. */}
          <p className="muted">{story.gist[uiLang] || story.gist.en}</p>
        </div>
        <span className="chip">
          {t(["learn.easy", "learn.medium", "learn.hard"][story.level - 1])} &middot; {story.minutes} {t("c.min")}
        </span>
      </div>

      <h3 className="section-label">{t("learn.readStory")}</h3>
      <div className="story-body" lang={story.lang}>
        {story.text.map((line, i) => (
          <p key={line} className="story-line">
            <span className="native">{line}</span>
            {showRoman && <span className="roman">{story.roman[i]}</span>}
          </p>
        ))}
      </div>

      <div className="story-tools">
        <button type="button" className="btn btn-quiet btn-sm" onClick={() => setShowRoman((s) => !s)}>
          {showRoman ? "Aa ✓" : "Aa"}
        </button>
        <button type="button" className="btn btn-quiet btn-sm" onClick={readAloud} disabled={!voiceAvailable}>
          {speaking ? t("c.close") : t("learn.hearStory")}
        </button>
      </div>
      {!voiceAvailable && <p className="muted small">{t("learn.noVoice")}</p>}

      <h3 className="section-label">{t("learn.words")}</h3>
      <ul className="word-list">
        {story.words.map((w) => (
          <li key={w.w}>
            <button
              type="button"
              className="word"
              onClick={() => speak(w.w, story.lang, { rate: 0.7 })}
              disabled={!voiceAvailable}
            >
              <span className="native" lang={story.lang}>
                {w.w}
              </span>
              <span className="roman">{w.r}</span>
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="btn btn-primary btn-wide" onClick={() => setPhase("quiz")}>
        {t("learn.qHeading")}
      </button>
      <button type="button" className="btn btn-quiet btn-wide" onClick={onExit}>
        {t("c.back")}
      </button>
    </div>
  );
}
