import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../i18n/index.jsx";
import { useApp } from "../context/AppContext.jsx";
import { useSpeech } from "../hooks/useSpeech.js";
import { languageById } from "../data/languages.js";
import { storiesFor } from "../data/stories.js";
import {
  attemptCount,
  calculateResult,
  fetchQuestions,
  saveResult,
  startAssessment,
  submitAnswer,
} from "../api/assessmentApi.js";
import QuickQuiz from "../components/QuickQuiz.jsx";
import Puzzles from "../components/Puzzles.jsx";
import ListenFind from "../components/ListenFind.jsx";
import LetterSprint from "../components/LetterSprint.jsx";
import MissingPiece from "../components/MissingPiece.jsx";
import StoryOrder from "../components/StoryOrder.jsx";

/** v3: the game modes sit above the skill tests. v3.1 adds four more. */
const GAMES = [
  { id: "quiz", nameKey: "as.quiz", descKey: "as.d.quiz", icon: "⚡", Component: QuickQuiz },
  { id: "puzzle", nameKey: "as.puzzle", descKey: "as.d.puzzle", icon: "🧩", Component: Puzzles },
  { id: "listen", nameKey: "as.listen", descKey: "as.d.listen", icon: "👂", Component: ListenFind },
  { id: "sprint", nameKey: "as.sprint", descKey: "as.d.sprint", icon: "🏃", Component: LetterSprint },
  { id: "missing", nameKey: "as.missing", descKey: "as.d.missing", icon: "🔍", Component: MissingPiece },
  { id: "order", nameKey: "as.order", descKey: "as.d.order", icon: "📜", Component: StoryOrder },
];

const gameById = (id) => GAMES.find((g) => g.id === id);

/** History rows name games by game, and tests by the skill they measure. */
const typeLabel = (type) => gameById(type)?.nameKey || `skill.${type}`;

const TYPES = [
  { id: "reading", nameKey: "skill.reading", descKey: "as.d.reading" },
  { id: "writing", nameKey: "skill.writing", descKey: "as.d.writing" },
  { id: "comprehension", nameKey: "skill.comprehension", descKey: "as.d.comprehension" },
];

/**
 * Assessments.
 *
 * Questions are built from the same letter set and story library the learner
 * is actually working through, so an assessment measures this learner's
 * progress rather than general knowledge of the script. Each answer goes
 * through the assessment API one at a time - question, given answer, correct
 * answer, score - because the proficiency model needs the per-question record,
 * not just a final percentage.
 */
export default function Assessment({ params, go }) {
  const { t } = useI18n();
  const { learner } = useApp();
  const [active, setActive] = useState(params?.type || null);

  useEffect(() => {
    if (params?.type) setActive(params.type);
  }, [params]);

  const activeGame = gameById(active);
  if (activeGame) {
    const Game = activeGame.Component;
    return (
      <div className="page assess">
        <Game onExit={() => setActive(null)} />
      </div>
    );
  }
  if (active) return <Runner type={active} onExit={() => setActive(null)} go={go} />;

  return (
    <div className="page assess">
      <header className="page-head">
        <h1>{t("as.title")}</h1>
        <p className="muted">{t("as.sub")}</p>
      </header>

      <h2 className="section-label">{t("as.fun")}</h2>
      <div className="assess-grid">
        {GAMES.map((game) => {
          const attempts = attemptCount(learner.email, `${game.id}:${learner.langId}`);
          return (
            <button
              type="button"
              key={game.id}
              className="assess-card game-card"
              onClick={() => setActive(game.id)}
            >
              <span className="game-icon" aria-hidden="true">
                {game.icon}
              </span>
              <strong>{t(game.nameKey)}</strong>
              <span className="muted">{t(game.descKey)}</span>
              <span className="chip small">{t("as.attemptsN", { n: attempts })}</span>
            </button>
          );
        })}
      </div>

      <h2 className="section-label">{t("as.tests")}</h2>
      <div className="assess-grid">
        {TYPES.map((type) => {
          const attempts = attemptCount(learner.email, `${type.id}:${learner.langId}`);
          return (
            <button type="button" key={type.id} className="assess-card" onClick={() => setActive(type.id)}>
              <strong>{t(type.nameKey)}</strong>
              <span className="muted">{t(type.descKey)}</span>
              <span className="chip small">{t("as.attemptsN", { n: attempts })}</span>
            </button>
          );
        })}
      </div>

      <h2 className="section-label">{t("as.history")}</h2>
      {learner.results.length === 0 ? (
        <p className="muted">{t("as.noHistory")}</p>
      ) : (
        <ul className="result-list">
          {learner.results.slice(0, 8).map((r, i) => (
            <li key={`${r.date}-${i}`}>
              <span>{t(typeLabel(r.type))}</span>
              <span className="muted small">{new Date(r.date).toLocaleDateString()}</span>
              <strong>{r.score}%</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- runner */

function Runner({ type, onExit }) {
  const { t } = useI18n();
  const { learner, recordResult } = useApp();
  const { speak, hasVoiceFor } = useSpeech();

  const questions = useMemo(() => fetchQuestions(buildQuestions(type, learner)), [type, learner]);
  const [attempt] = useState(() =>
    startAssessment({ learnerId: learner.email, assessmentId: `${type}:${learner.langId}` })
  );

  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [picked, setPicked] = useState(null);
  const [responses, setResponses] = useState([]);
  const [finished, setFinished] = useState(null);

  const question = questions[index];
  const voice = hasVoiceFor(learner.langId);

  function grade(given) {
    const score = String(given).trim().toLowerCase() === String(question.answer).trim().toLowerCase() ? 1 : 0;
    const response = submitAnswer({
      attemptId: attempt.id,
      learnerId: learner.email,
      questionId: question.id,
      learnerAnswer: String(given),
      correctAnswer: String(question.answer),
      score,
    });
    const all = [...responses, response];
    setResponses(all);

    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setTyped("");
      setPicked(null);
      return;
    }

    const result = calculateResult(all);
    const record = {
      type,
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

  if (finished) {
    return (
      <div className="page assess">
        <div className="card story-done">
          <h2>{t("as.result", { n: finished.score })}</h2>
          <p className="score-line">
            {finished.correct} {t("c.of")} {finished.total}
          </p>
          <button type="button" className="btn btn-primary btn-wide" onClick={onExit}>
            {t("as.backHub")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page assess">
      <div className="card">
        <p className="muted small">{t("learn.qOf", { a: index + 1, b: questions.length })}</p>
        <h2 className="q-text" lang={question.lang || learner.langId}>
          {question.prompt}
        </h2>
        {question.hint && <p className="muted">{question.hint}</p>}

        {question.speakable && voice && (
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={() => speak(question.speakable, learner.langId, { rate: 0.6 })}
          >
            {t("c.listen")}
          </button>
        )}

        {question.kind === "mcq" ? (
          <div className="options">
            {question.options.map((opt) => (
              <button
                type="button"
                key={opt}
                className={`option${picked === opt ? " dim" : ""}`}
                lang={question.optionLang || undefined}
                onClick={() => {
                  setPicked(opt);
                  grade(opt);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="typed-answer">
            <input
              type="text"
              value={typed}
              placeholder={t("as.typeHere")}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && typed.trim() && grade(typed)}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => typed.trim() && grade(typed)}
            >
              {t("c.submit")}
            </button>
          </div>
        )}

        <button type="button" className="btn btn-quiet btn-wide" onClick={onExit}>
          {t("as.backHub")}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------ question building */

function shuffled(arr, seed) {
  const out = [...arr];
  let s = seed || 7;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const j = Math.abs(s) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Questions are drawn from the learner's own script and story set. Reading and
 * writing pull from the letters; comprehension reuses questions from stories
 * the learner has actually read, falling back to the easiest unread story so a
 * new learner is not handed an empty paper.
 */
function buildQuestions(type, learner) {
  const lang = languageById(learner.langId);
  const seed = Date.now() % 100000;

  if (type === "reading") {
    return shuffled(lang.letters, seed)
      .slice(0, 6)
      .map((letter, i) => {
        const distractors = shuffled(
          lang.letters.filter((l) => l.r !== letter.r),
          seed + i
        )
          .slice(0, 3)
          .map((l) => l.r);
        return {
          id: `read-${letter.r}-${i}`,
          kind: "mcq",
          prompt: letter.g,
          lang: learner.langId,
          speakable: letter.g,
          options: shuffled([letter.r, ...distractors], seed + i * 3),
          answer: letter.r,
        };
      });
  }

  if (type === "writing") {
    return shuffled(lang.letters, seed + 1)
      .slice(0, 6)
      .map((letter, i) => ({
        id: `write-${letter.r}-${i}`,
        kind: "text",
        prompt: letter.g,
        lang: learner.langId,
        speakable: letter.g,
        answer: letter.r,
      }));
  }

  // comprehension
  const readIds = new Set(learner.storyRuns.map((r) => r.storyId));
  const pool = storiesFor(learner.langId);
  const preferred = pool.filter((s) => readIds.has(s.id));
  const source = (preferred.length ? preferred : pool).slice(0, 2);

  return source
    .flatMap((story) =>
      story.questions.map((q, i) => ({
        id: `${story.id}-q${i}`,
        kind: "mcq",
        prompt: q.q,
        hint: story.text.join(" "),
        lang: story.lang,
        optionLang: story.lang,
        options: q.options,
        answer: q.options[q.answer],
      }))
    )
    .slice(0, 6);
}
