import { useMemo, useState } from "react";
import { useI18n } from "../i18n/index.jsx";
import { useApp } from "../context/AppContext.jsx";
import { useSpeech } from "../hooks/useSpeech.js";
import { languageById } from "../data/languages.js";
import { storiesFor } from "../data/stories.js";
import { useGameRecorder, shuffle } from "../hooks/useGameRecorder.js";
import { splitGraphemes } from "./Puzzles.jsx";
import GameDone from "./GameDone.jsx";

const ROUNDS = 6;
const FEEDBACK_MS = 1100;

/**
 * Missing piece (v3.1).
 *
 * A vocabulary word from the learner's own stories with one written piece
 * taken out; pick the piece that completes it. Pieces are grapheme clusters
 * (the same Intl.Segmenter split the word builder uses), so a Hindi learner
 * chooses between "क्षा" and "की", never between loose vowel signs.
 */
export default function MissingPiece({ onExit }) {
  const { t } = useI18n();
  const { learner } = useApp();
  const { speak, hasVoiceFor } = useSpeech();
  const voice = hasVoiceFor(learner.langId);
  const game = useGameRecorder("missing");

  const rounds = useMemo(() => buildRounds(learner.langId), [learner.langId]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const round = rounds[index];

  function choose(opt) {
    if (picked !== null) return;
    setPicked(opt);
    const ok = opt === round.answer;
    game.record(round.id, opt, round.answer, ok);
    if (voice) speak(round.word.w, learner.langId, { rate: 0.7 });
    setTimeout(() => {
      if (index + 1 < rounds.length) {
        setIndex(index + 1);
        setPicked(null);
      } else {
        game.finish();
      }
    }, FEEDBACK_MS);
  }

  if (game.finished) return <GameDone result={game.finished} onExit={onExit} />;
  if (!round) return null;

  return (
    <div className="card quiz-card">
      <div className="quiz-top">
        <span className="muted small">{t("learn.qOf", { a: index + 1, b: rounds.length })}</span>
      </div>
      <h2>{t("as.missing")}</h2>
      <p className="muted">{t("gm.missingHelp", { r: round.word.r })}</p>

      {voice && (
        <button
          type="button"
          className="btn btn-quiet btn-sm"
          onClick={() => speak(round.word.w, learner.langId, { rate: 0.7 })}
        >
          {t("c.listen")}
        </button>
      )}

      <div
        className={`build-slot${picked !== null ? (picked === round.answer ? " solved" : " wrong") : ""}`}
        lang={learner.langId}
        aria-live="polite"
      >
        <span className="gap-word">
        {round.pieces.map((p, k) =>
          k === round.gap ? (
            <span key={k} className={`gap-piece${picked !== null ? " filled" : ""}`}>
              {picked !== null ? round.answer : "?"}
            </span>
          ) : (
            <span key={k}>{p}</span>
          )
        )}
        </span>
      </div>

      <div className="options options-grid">
        {round.options.map((opt) => {
          let state = "";
          if (picked !== null) {
            if (opt === round.answer) state = " right";
            else if (opt === picked) state = " wrong";
            else state = " dim";
          }
          return (
            <button
              type="button"
              key={opt}
              className={`option option-glyph${state}`}
              lang={learner.langId}
              disabled={picked !== null}
              onClick={() => choose(opt)}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <p className={`verdict ${picked === round.answer ? "right" : "wrong"}`}>
          {picked === round.answer ? t("c.correct") : t("c.wrong")}
        </p>
      )}

      <button type="button" className="btn btn-quiet btn-wide" onClick={onExit}>
        {t("as.backHub")}
      </button>
    </div>
  );
}

function buildRounds(langId) {
  const words = storiesFor(langId).flatMap((s) => s.words);
  const usable = words.filter((w) => splitGraphemes(w.w).length >= 2);
  const pool = shuffle(usable.length ? usable : words);

  // Distractors come from the same script: pieces of the other story words,
  // topped up with the starter letters.
  const piecePool = new Set([
    ...words.flatMap((w) => splitGraphemes(w.w)),
    ...languageById(langId).letters.map((l) => l.g),
  ]);

  const out = [];
  for (let i = 0; out.length < ROUNDS && i < pool.length * 2; i++) {
    const word = pool[i % pool.length];
    const pieces = splitGraphemes(word.w);
    const gap = Math.floor(Math.random() * pieces.length);
    const answer = pieces[gap];
    const distractors = shuffle([...piecePool].filter((p) => p !== answer && p.trim())).slice(0, 3);
    if (distractors.length < 3) continue;
    out.push({
      id: `missing-${out.length}-${word.w}-${gap}`,
      word,
      pieces,
      gap,
      answer,
      options: shuffle([answer, ...distractors]),
    });
  }
  return out;
}
