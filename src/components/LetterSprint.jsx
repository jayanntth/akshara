import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/index.jsx";
import { useApp } from "../context/AppContext.jsx";
import { languageById } from "../data/languages.js";
import { useGameRecorder, shuffle } from "../hooks/useGameRecorder.js";
import GameDone from "./GameDone.jsx";

const SECONDS = 45;
const FLASH_MS = 350;

/**
 * Letter sprint (v3.1).
 *
 * A letter and a sound appear together; the learner says yes or no as fast as
 * they can for 45 seconds. Half the pairs are true. Points reward speed and a
 * run of right answers, but the stored score is plain accuracy over the pairs
 * answered - the race makes it fun, it should not punish a careful reader.
 */
export default function LetterSprint({ onExit }) {
  const { t } = useI18n();
  const { learner } = useApp();
  const game = useGameRecorder("sprint");
  const letters = languageById(learner.langId).letters;
  const isEnglish = learner.langId === "en";

  const [started, setStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(SECONDS);
  const [pair, setPair] = useState(() => makePair(letters));
  const [flash, setFlash] = useState(null); // "right" | "wrong" | null
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const count = useRef(0);

  useEffect(() => {
    if (!started || game.finished) return undefined;
    if (secondsLeft <= 0) {
      if (game.answered() === 0) {
        // Nothing answered: record one miss so the attempt still closes cleanly.
        game.record("sprint-none", "", "answer", false);
      }
      game.finish();
      return undefined;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, secondsLeft, game.finished]);

  function answer(saidYes) {
    if (flash || secondsLeft <= 0) return;
    const ok = saidYes === pair.match;
    count.current += 1;
    game.record(
      `sprint-${count.current}-${pair.letter.r}-${pair.shown}`,
      saidYes ? "yes" : "no",
      pair.match ? "yes" : "no",
      ok
    );
    if (ok) {
      const next = streak + 1;
      setStreak(next);
      setBestStreak((b) => Math.max(b, next));
      setPoints((p) => p + 10 + (next - 1) * 2);
    } else {
      setStreak(0);
    }
    setFlash(ok ? "right" : "wrong");
    setTimeout(() => {
      setFlash(null);
      setPair(makePair(letters));
    }, FLASH_MS);
  }

  if (game.finished) {
    return (
      <GameDone result={game.finished} onExit={onExit}>
        <p className="xp-line">{t("as.points", { n: points })}</p>
        <p className="muted">{t("as.best", { n: bestStreak })}</p>
      </GameDone>
    );
  }

  if (!started) {
    return (
      <div className="card quiz-card center">
        <h2>{t("as.sprint")}</h2>
        <p className="muted">{t("gm.sprintHelp", { n: SECONDS })}</p>
        <button type="button" className="btn btn-primary btn-lg" onClick={() => setStarted(true)}>
          {t("c.start")}
        </button>
        <button type="button" className="btn btn-quiet btn-wide" onClick={onExit}>
          {t("as.backHub")}
        </button>
      </div>
    );
  }

  const pct = (secondsLeft / SECONDS) * 100;

  return (
    <div className="card quiz-card">
      <div className="quiz-top">
        <span className="muted small">{t("as.timeLeft", { n: secondsLeft })}</span>
        <span className={`chip small${streak >= 3 ? " hot" : ""}`}>{t("as.streak", { n: streak })}</span>
        <span className="chip small">{t("as.points", { n: points })}</span>
      </div>
      <div className="timer">
        <span className={`timer-fill${secondsLeft <= 10 ? " low" : ""}`} style={{ width: `${pct}%` }} />
      </div>

      <p className="quiz-kind sprint-q">{t("gm.sprintQ")}</p>
      <div className={`sprint-pair${flash ? ` ${flash}` : ""}`} aria-live="polite">
        <span className="sprint-glyph" lang={learner.langId}>
          {isEnglish ? pair.letter.g.toUpperCase() : pair.letter.g}
        </span>
        <span className="sprint-eq" aria-hidden="true">=</span>
        <span className="sprint-sound" lang="en">“{pair.shown}”</span>
      </div>

      <div className="sprint-actions">
        <button type="button" className="btn sprint-no" onClick={() => answer(false)} disabled={!!flash}>
          ✗ {t("gm.no")}
        </button>
        <button type="button" className="btn sprint-yes" onClick={() => answer(true)} disabled={!!flash}>
          ✓ {t("gm.yes")}
        </button>
      </div>

      <button type="button" className="btn btn-quiet btn-wide" onClick={onExit}>
        {t("as.backHub")}
      </button>
    </div>
  );
}

function makePair(letters) {
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const match = Math.random() < 0.5;
  const shown = match ? letter.r : shuffle(letters.filter((l) => l.r !== letter.r))[0].r;
  return { letter, shown, match };
}
