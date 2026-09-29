import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../i18n/index.jsx";
import { useApp } from "../context/AppContext.jsx";
import { useSpeech } from "../hooks/useSpeech.js";
import { languageById } from "../data/languages.js";
import { useGameRecorder, shuffle } from "../hooks/useGameRecorder.js";
import GameDone from "./GameDone.jsx";

const ROUNDS = 8;
const FEEDBACK_MS = 900;

/**
 * Listen & find (v3.1).
 *
 * The browser says a letter; the learner taps the one they heard. This is the
 * only game that measures listening directly, so it matters most for learners
 * who read a sound fine on paper but do not recognise it spoken.
 *
 * If the device has no voice for the script, the sound is written out instead
 * so the game still works - it just becomes a reading round, and says so.
 */
export default function ListenFind({ onExit }) {
  const { t } = useI18n();
  const { learner } = useApp();
  const { speak, hasVoiceFor } = useSpeech();
  const voice = hasVoiceFor(learner.langId);
  const game = useGameRecorder("listen");

  const rounds = useMemo(() => {
    const letters = languageById(learner.langId).letters;
    return shuffle(letters)
      .slice(0, ROUNDS)
      .map((l, i) => ({
        id: `listen-${i}-${l.r}`,
        letter: l,
        options: shuffle([l, ...shuffle(letters.filter((x) => x.g !== l.g)).slice(0, 3)]),
      }));
  }, [learner.langId]);

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const round = rounds[index];

  // Say each new letter once as it appears.
  useEffect(() => {
    if (!game.finished && voice && round) {
      const id = setTimeout(() => speak(round.letter.g, learner.langId, { rate: 0.6 }), 250);
      return () => clearTimeout(id);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  function choose(opt) {
    if (picked) return;
    setPicked(opt.g);
    const ok = opt.g === round.letter.g;
    game.record(round.id, opt.g, round.letter.g, ok);
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
      <h2>{t("as.listen")}</h2>
      <p className="muted">{voice ? t("gm.listenHelp") : t("gm.noVoice")}</p>

      <div className="listen-stage">
        {voice ? (
          <button
            type="button"
            className="listen-play"
            onClick={() => speak(round.letter.g, learner.langId, { rate: 0.6 })}
            aria-label={t("gm.play")}
          >
            <span aria-hidden="true">🔊</span>
            <span className="small">{t("gm.play")}</span>
          </button>
        ) : (
          <p className="q-big" lang="en">“{round.letter.r}”</p>
        )}
      </div>

      <div className="options options-grid">
        {round.options.map((opt) => {
          let state = "";
          if (picked) {
            if (opt.g === round.letter.g) state = " right";
            else if (opt.g === picked) state = " wrong";
            else state = " dim";
          }
          return (
            <button
              type="button"
              key={opt.g}
              className={`option option-glyph${state}`}
              lang={learner.langId}
              disabled={!!picked}
              onClick={() => choose(opt)}
            >
              {learner.langId === "en" ? opt.g.toUpperCase() : opt.g}
            </button>
          );
        })}
      </div>

      {picked && (
        <p className={`verdict ${picked === round.letter.g ? "right" : "wrong"}`}>
          {picked === round.letter.g ? t("c.correct") : t("c.wrong")}
        </p>
      )}

      <button type="button" className="btn btn-quiet btn-wide" onClick={onExit}>
        {t("as.backHub")}
      </button>
    </div>
  );
}
