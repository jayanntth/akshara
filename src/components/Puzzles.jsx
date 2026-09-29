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

const PAIRS = 6;
const WORD_ROUNDS = 3;

/**
 * Puzzles (v3 change #2).
 *
 * Round one is a memory match: letter cards and sound cards face down, flip
 * two at a time, keep the pairs. Rounds two to four are word builders: a
 * vocabulary word from the learner's own stories, broken into its written
 * pieces and scrambled, to be tapped back into order.
 *
 * Words are split with Intl.Segmenter into grapheme clusters, not code
 * points. That is the difference between handing a Kannada learner "ಕ" + "್"
 * + "ಷ" as three tiles (meaningless) and handing them the syllables they
 * actually read.
 */
export default function Puzzles({ onExit }) {
  const { t } = useI18n();
  const { learner, recordResult } = useApp();
  const [attempt] = useState(() =>
    startAssessment({ learnerId: learner.email, assessmentId: `puzzle:${learner.langId}` })
  );
  const words = useMemo(() => pickWords(learner.langId), [learner.langId]);
  const totalRounds = 1 + words.length;

  const [round, setRound] = useState(0);
  const [finished, setFinished] = useState(null);
  const responses = useRef([]);

  function record(questionId, given, correct, ok) {
    responses.current.push(
      submitAnswer({
        attemptId: attempt.id,
        learnerId: learner.email,
        questionId,
        learnerAnswer: given,
        correctAnswer: correct,
        score: ok ? 1 : 0,
      })
    );
  }

  function nextRound() {
    if (round + 1 < totalRounds) {
      setRound(round + 1);
      return;
    }
    const result = calculateResult(responses.current);
    const rec = {
      type: "puzzle",
      language: learner.langId,
      score: result.score,
      correct: result.correct,
      total: result.total,
      proficiency: result.proficiency,
      attemptId: attempt.id,
    };
    saveResult({ ...rec, learnerId: learner.email, date: new Date().toISOString() });
    recordResult(rec);
    setFinished(result);
  }

  if (finished) {
    return (
      <div className="card story-done">
        <Teacher mood={finished.score >= 70 ? "cheer" : "smile"} size={96} />
        <h2>{t("as.result", { n: finished.score })}</h2>
        <p className="score-line">
          {finished.correct} {t("c.of")} {finished.total}
        </p>
        <button type="button" className="btn btn-primary btn-wide" onClick={onExit}>
          {t("as.backHub")}
        </button>
      </div>
    );
  }

  return (
    <div className="card puzzle-card">
      <p className="muted small">{t("pz.round", { a: round + 1, b: totalRounds })}</p>
      {round === 0 ? (
        <MemoryMatch
          key="match"
          onDone={(moves) => {
            // A clean game needs PAIRS moves; allow some searching before it
            // stops counting as "knows these letters".
            const ok = moves <= PAIRS * 2 + 2;
            record("match", String(moves), String(PAIRS), ok);
            nextRound();
          }}
        />
      ) : (
        <WordBuilder
          key={words[round - 1].w}
          word={words[round - 1]}
          onDone={(ok, given) => {
            record(`build-${words[round - 1].w}`, given, words[round - 1].w, ok);
            nextRound();
          }}
        />
      )}
      <button type="button" className="btn btn-quiet btn-wide" onClick={onExit}>
        {t("as.backHub")}
      </button>
    </div>
  );
}

/* ----------------------------------------------------------- memory match */

function MemoryMatch({ onDone }) {
  const { t } = useI18n();
  const { learner } = useApp();
  const { speak, hasVoiceFor } = useSpeech();
  const voice = hasVoiceFor(learner.langId);
  const isEnglish = learner.langId === "en";

  const cards = useMemo(() => {
    const letters = shuffle(languageById(learner.langId).letters).slice(0, PAIRS);
    const deck = letters.flatMap((l, i) => [
      { id: `g${i}`, pair: i, face: isEnglish ? l.g.toUpperCase() : l.g, kind: "glyph", glyph: l.g },
      { id: `r${i}`, pair: i, face: l.r, kind: "sound", glyph: l.g },
    ]);
    return shuffle(deck);
  }, [learner.langId, isEnglish]);

  const [open, setOpen] = useState([]); // ids currently face up, max 2
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (matched.size === cards.length) {
      const id = setTimeout(() => onDone(moves), 700);
      return () => clearTimeout(id);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched]);

  function flip(card) {
    if (busy || matched.has(card.id) || open.includes(card.id)) return;
    if (card.kind === "glyph" && voice) speak(card.glyph, learner.langId, { rate: 0.6 });

    const nextOpen = [...open, card.id];
    setOpen(nextOpen);
    if (nextOpen.length < 2) return;

    setMoves((m) => m + 1);
    const [a, b] = nextOpen.map((id) => cards.find((c) => c.id === id));
    if (a.pair === b.pair && a.kind !== b.kind) {
      setMatched((prev) => new Set([...prev, a.id, b.id]));
      setOpen([]);
    } else {
      setBusy(true);
      setTimeout(() => {
        setOpen([]);
        setBusy(false);
      }, 850);
    }
  }

  return (
    <>
      <h2>{t("pz.match")}</h2>
      <p className="muted">{t("pz.matchHelp")}</p>
      <div className="quiz-top">
        <span className="chip small">{t("pz.pairs", { a: matched.size / 2, b: PAIRS })}</span>
        <span className="chip small">{t("pz.moves", { n: moves })}</span>
      </div>
      <div className="memory-grid">
        {cards.map((card) => {
          const up = open.includes(card.id) || matched.has(card.id);
          return (
            <button
              type="button"
              key={card.id}
              className={`mem-card${up ? " up" : ""}${matched.has(card.id) ? " matched" : ""}`}
              onClick={() => flip(card)}
              aria-label={up ? card.face : "?"}
            >
              <span className="mem-inner">
                <span className="mem-back" aria-hidden="true">
                  ?
                </span>
                <span
                  className={`mem-front ${card.kind}`}
                  lang={card.kind === "glyph" ? learner.langId : "en"}
                >
                  {card.face}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ----------------------------------------------------------- word builder */

function WordBuilder({ word, onDone }) {
  const { t } = useI18n();
  const { learner } = useApp();
  const { speak, hasVoiceFor } = useSpeech();
  const voice = hasVoiceFor(learner.langId);

  const pieces = useMemo(() => splitGraphemes(word.w), [word.w]);
  const tiles = useMemo(() => scramble(pieces.map((p, i) => ({ p, i }))), [pieces]);

  const [chosen, setChosen] = useState([]); // tile indices into `tiles`
  const [state, setState] = useState("playing"); // playing | wrong | solved | revealed

  const built = chosen.map((k) => tiles[k].p).join("");

  function tap(k) {
    if (state === "solved" || state === "revealed" || chosen.includes(k)) return;
    const next = [...chosen, k];
    setChosen(next);
    if (next.length === tiles.length) {
      const attemptWord = next.map((x) => tiles[x].p).join("");
      if (attemptWord === word.w) {
        setState("solved");
        if (voice) speak(word.w, learner.langId, { rate: 0.7 });
      } else {
        setState("wrong");
      }
    }
  }

  function clear() {
    setChosen([]);
    setState("playing");
  }

  function reveal() {
    setChosen(tiles.map((_, k) => k).sort((a, b) => tiles[a].i - tiles[b].i));
    setState("revealed");
  }

  return (
    <>
      <h2>{t("pz.build")}</h2>
      <p className="muted">{t("pz.buildHelp", { r: word.r })}</p>

      {voice && (
        <button
          type="button"
          className="btn btn-quiet btn-sm"
          onClick={() => speak(word.w, learner.langId, { rate: 0.7 })}
        >
          {t("c.listen")}
        </button>
      )}

      <div
        className={`build-slot${state === "solved" ? " solved" : ""}${state === "wrong" ? " wrong" : ""}`}
        lang={learner.langId}
        aria-live="polite"
      >
        {built || <span className="build-placeholder">…</span>}
      </div>

      <div className="tile-row" lang={learner.langId}>
        {tiles.map((tile, k) => (
          <button
            type="button"
            key={`${tile.p}-${k}`}
            className={`tile${chosen.includes(k) ? " used" : ""}`}
            onClick={() => tap(k)}
            disabled={chosen.includes(k) || state === "solved" || state === "revealed"}
          >
            {tile.p}
          </button>
        ))}
      </div>

      {state === "solved" && <p className="verdict right">{t("pz.solved")}</p>}
      {state === "wrong" && <p className="verdict wrong">{t("c.wrong")}</p>}

      <div className="story-tools">
        {(state === "playing" || state === "wrong") && (
          <>
            <button type="button" className="btn btn-quiet btn-sm" onClick={clear} disabled={!chosen.length}>
              {t("pz.clear")}
            </button>
            <button type="button" className="btn btn-quiet btn-sm" onClick={reveal}>
              {t("pz.reveal")}
            </button>
          </>
        )}
      </div>

      {(state === "solved" || state === "revealed") && (
        <button
          type="button"
          className="btn btn-primary btn-wide"
          // Solving it after one wrong try still counts; giving up does not.
          onClick={() => onDone(state === "solved", built)}
        >
          {t("c.next")}
        </button>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- helpers */

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Shuffle, but never hand back the pieces already in the right order. */
function scramble(tiles) {
  if (tiles.length < 2) return tiles;
  for (let tries = 0; tries < 10; tries++) {
    const s = shuffle(tiles);
    if (s.some((tile, k) => tile.i !== k)) return s;
  }
  return [...tiles].reverse();
}

export function splitGraphemes(text) {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/** Vocabulary words from the learner's own stories, with at least two pieces. */
function pickWords(langId) {
  const all = storiesFor(langId).flatMap((s) => s.words);
  const usable = all.filter((w) => splitGraphemes(w.w).length >= 2);
  return shuffle(usable.length ? usable : all).slice(0, WORD_ROUNDS);
}
