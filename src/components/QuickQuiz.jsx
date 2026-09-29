import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "../i18n/index.jsx";
import { useApp } from "../context/AppContext.jsx";
import { useSpeech } from "../hooks/useSpeech.js";
import { languageById } from "../data/languages.js";
import { storiesFor } from "../data/stories.js";
import {
  calculateResult,
  saveResult,
  startAssessment,
  submitAnswer,
} from "../api/assessmentApi.js";
import Teacher from "./Teacher.jsx";

const QUESTION_COUNT = 10;
const SECONDS = 15;
const FEEDBACK_MS = 800;

/**
 * Quick quiz (v3 change #2).
 *
 * Ten mixed questions against a fifteen-second clock: letter to sound, sound
 * to letter, and a question lifted from one of the stories. Points reward
 * speed and a run of right answers, but the result stored for the proficiency
 * model is the plain percentage correct - the clock makes it a game, it should
 * not make a slow reader look like a weak one.
 */
export default function QuickQuiz({ onExit }) {
  const { t } = useI18n();
  const { learner, recordResult } = useApp();
  const { speak, hasVoiceFor } = useSpeech();

  const questions = useMemo(() => buildQuiz(learner), [learner.langId]); // eslint-disable-line react-hooks/exhaustive-deps
  const [attempt] = useState(() =>
    startAssessment({ learnerId: learner.email, assessmentId: `quiz:${learner.langId}` })
  );

  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(SECONDS);
  const [picked, setPicked] = useState(null); // option string, or "__timeout__"
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [finished, setFinished] = useState(null);
  const responses = useRef([]);

  const question = questions[index];
  const voice = hasVoiceFor(learner.langId);

  // Countdown. Braces on every effect body - an arrow that returns a value
  // hands it to React as a cleanup function.
  useEffect(() => {
    if (finished || picked !== null) return undefined;
    if (secondsLeft <= 0) {
      answer("__timeout__");
      return undefined;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, picked, finished]);

  function answer(option) {
    if (picked !== null || !question) return;
    setPicked(option);
    const right = option === question.answer;

    responses.current.push(
      submitAnswer({
        attemptId: attempt.id,
        learnerId: learner.email,
        questionId: question.id,
        learnerAnswer: option === "__timeout__" ? "" : option,
        correctAnswer: question.answer,
        score: right ? 1 : 0,
      })
    );

    if (right) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setBestStreak((b) => Math.max(b, nextStreak));
      setPoints((p) => p + 10 + secondsLeft + (nextStreak - 1) * 5);
    } else {
      setStreak(0);
    }

    setTimeout(advance, FEEDBACK_MS);
  }

  function advance() {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setPicked(null);
      setSecondsLeft(SECONDS);
      return;
    }
    const result = calculateResult(responses.current);
    const record = {
      type: "quiz",
      language: learner.langId,
      score: result.score,
      correct: result.correct,
      total: result.total,
      proficiency: result.proficiency,
      attemptId: attempt.id,
    };
    saveResult({ ...record, learnerId: learner.email, date: new Date().toISOString() });
    recordResult(record);
    setFinished(result);
  }

  /* ---------------------------------------------------------------- done */
  if (finished) {
    return (
      <div className="card story-done">
        <Teacher mood={finished.score >= 70 ? "cheer" : "smile"} size={96} />
        <h2>{t("as.result", { n: finished.score })}</h2>
        <p className="score-line">
          {finished.correct} {t("c.of")} {finished.total}
        </p>
        <p className="xp-line">{t("as.points", { n: points })}</p>
        <p className="muted">{t("as.best", { n: bestStreak })}</p>
        <button type="button" className="btn btn-primary btn-wide" onClick={onExit}>
          {t("as.backHub")}
        </button>
      </div>
    );
  }

  if (!question) return null;

  const timedOut = picked === "__timeout__";
  const pct = (secondsLeft / SECONDS) * 100;

  /* ------------------------------------------------------------ question */
  return (
    <div className="card quiz-card">
      <div className="quiz-top">
        <span className="muted small">{t("learn.qOf", { a: index + 1, b: questions.length })}</span>
        <span className={`chip small${streak >= 2 ? " hot" : ""}`}>{t("as.streak", { n: streak })}</span>
        <span className="chip small">{t("as.points", { n: points })}</span>
      </div>

      <div className="timer" aria-label={t("as.timeLeft", { n: secondsLeft })}>
        <span className={`timer-fill${secondsLeft <= 5 ? " low" : ""}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="muted small timer-text">{t("as.timeLeft", { n: secondsLeft })}</p>

      <p className="quiz-kind">{question.kindKey ? t(question.kindKey) : null}</p>
      <h2 className={`q-text${question.big ? " q-big" : ""}`} lang={question.promptLang}>
        {question.prompt}
      </h2>

      {question.speakable && voice && (
        <button
          type="button"
          className="btn btn-quiet btn-sm"
          onClick={() => speak(question.speakable, learner.langId, { rate: 0.6 })}
        >
          {t("c.listen")}
        </button>
      )}

      <div className={`options${question.grid ? " options-grid" : ""}`}>
        {question.options.map((opt) => {
          let state = "";
          if (picked !== null) {
            if (opt === question.answer) state = " right";
            else if (opt === picked) state = " wrong";
            else state = " dim";
          }
          return (
            <button
              type="button"
              key={opt}
              className={`option${state}`}
              lang={question.optionLang}
              disabled={picked !== null}
              onClick={() => answer(opt)}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <p className={`verdict ${picked === question.answer ? "right" : "wrong"}`}>
          {timedOut ? t("as.timeUp") : picked === question.answer ? t("c.correct") : t("c.wrong")}
        </p>
      )}

      <button type="button" className="btn btn-quiet btn-wide" onClick={onExit}>
        {t("as.backHub")}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------ building */

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickOthers(pool, exclude, n) {
  return shuffle(pool.filter((x) => x !== exclude)).slice(0, n);
}

/**
 * Roughly 40% letter-to-sound, 30% sound-to-letter, 30% story questions,
 * shuffled together so the learner cannot settle into one kind of answer.
 */
function buildQuiz(learner) {
  const lang = languageById(learner.langId);
  const letters = lang.letters;
  const sounds = letters.map((l) => l.r);
  const glyphs = letters.map((l) => l.g);
  // In English a letter and its "sound" are the same character, so the
  // prompts switch to capitals and the task becomes matching upper to lower.
  const isEnglish = learner.langId === "en";
  const show = (l) => (isEnglish ? l.g.toUpperCase() : l.g);
  const out = [];

  shuffle(letters)
    .slice(0, 4)
    .forEach((l, i) => {
      out.push({
        id: `q-sound-${i}-${l.r}`,
        kindKey: "as.whichSound",
        prompt: show(l),
        promptLang: learner.langId,
        big: true,
        speakable: l.g,
        options: shuffle([l.r, ...pickOthers(sounds, l.r, 3)]),
        answer: l.r,
        grid: true,
      });
    });

  shuffle(letters)
    .slice(0, 3)
    .forEach((l, i) => {
      out.push({
        id: `q-letter-${i}-${l.r}`,
        kindKey: "as.whichLetter",
        prompt: isEnglish ? show(l) : `“${l.r}”`,
        promptLang: "en",
        big: true,
        speakable: l.g,
        options: shuffle([l.g, ...pickOthers(glyphs, l.g, 3)]),
        optionLang: learner.langId,
        answer: l.g,
        grid: true,
      });
    });

  const storyQs = shuffle(
    storiesFor(learner.langId).flatMap((s) =>
      s.questions.map((q, i) => ({ story: s, q, i }))
    )
  ).slice(0, QUESTION_COUNT - out.length);

  storyQs.forEach(({ story, q, i }) => {
    out.push({
      id: `q-story-${story.id}-${i}`,
      kindKey: null,
      prompt: q.q,
      promptLang: story.lang,
      options: shuffle(q.options),
      optionLang: story.lang,
      answer: q.options[q.answer],
    });
  });

  return shuffle(out).slice(0, QUESTION_COUNT);
}
