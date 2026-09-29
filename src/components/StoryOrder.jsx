import { useMemo, useState } from "react";
import { useI18n } from "../i18n/index.jsx";
import { useApp } from "../context/AppContext.jsx";
import { storiesFor } from "../data/stories.js";
import { useGameRecorder, shuffle } from "../hooks/useGameRecorder.js";
import GameDone from "./GameDone.jsx";

const STORY_ROUNDS = 3;

/**
 * Story order (v3.1).
 *
 * The sentences of a story, shuffled; tap them in the order they happen. To
 * get it right the learner has to read every line and follow what happens,
 * which makes this a comprehension round rather than a letter round. Stories
 * the learner has already read come first, like the comprehension test.
 */
export default function StoryOrder({ onExit }) {
  const { t } = useI18n();
  const { learner } = useApp();
  const game = useGameRecorder("order");

  const stories = useMemo(() => {
    const readIds = new Set((learner.storyRuns || []).map((r) => r.storyId));
    const pool = storiesFor(learner.langId).filter((s) => s.text.length >= 3);
    const read = shuffle(pool.filter((s) => readIds.has(s.id)));
    const unread = pool.filter((s) => !readIds.has(s.id)).sort((a, b) => a.level - b.level);
    return [...read, ...unread].slice(0, STORY_ROUNDS);
  }, [learner.langId]); // eslint-disable-line react-hooks/exhaustive-deps

  const [round, setRound] = useState(0);
  const story = stories[round];

  function next(ok, given) {
    game.record(`order-${story.id}`, given, story.text.map((_, i) => i).join(","), ok);
    if (round + 1 < stories.length) setRound(round + 1);
    else game.finish();
  }

  if (game.finished) return <GameDone result={game.finished} onExit={onExit} />;
  if (!story) return null;

  return (
    <div className="card puzzle-card">
      <p className="muted small">{t("pz.round", { a: round + 1, b: stories.length })}</p>
      <OrderRound key={story.id} story={story} onDone={next} />
      <button type="button" className="btn btn-quiet btn-wide" onClick={onExit}>
        {t("as.backHub")}
      </button>
    </div>
  );
}

function OrderRound({ story, onDone }) {
  const { t } = useI18n();
  const lines = useMemo(() => {
    const tagged = story.text.map((s, i) => ({ s, i }));
    for (let tries = 0; tries < 10; tries++) {
      const out = shuffle(tagged);
      if (out.some((x, k) => x.i !== k)) return out;
    }
    return [...tagged].reverse();
  }, [story]);

  const [chosen, setChosen] = useState([]); // indices into `lines`
  const [state, setState] = useState("playing"); // playing | wrong | solved | revealed
  const [tries, setTries] = useState(0);

  function tap(k) {
    if (state === "solved" || state === "revealed") return;
    if (chosen.includes(k)) {
      // Tapping a placed line takes it back out, so one slip is easy to fix.
      setChosen(chosen.filter((x) => x !== k));
      setState("playing");
      return;
    }
    const next = [...chosen, k];
    setChosen(next);
    if (next.length === lines.length) {
      const right = next.every((x, pos) => lines[x].i === pos);
      setState(right ? "solved" : "wrong");
      if (!right) setTries((n) => n + 1);
    }
  }

  function reveal() {
    setChosen(lines.map((_, k) => k).sort((a, b) => lines[a].i - lines[b].i));
    setState("revealed");
  }

  const given = chosen.map((k) => lines[k].i).join(",");

  return (
    <>
      <h2 lang={story.lang}>{story.title}</h2>
      <p className="muted">{t("gm.orderHelp")}</p>

      <ol className="order-list" lang={story.lang}>
        {lines.map((line, k) => {
          const pos = chosen.indexOf(k);
          return (
            <li key={k}>
              <button
                type="button"
                className={`order-line${pos >= 0 ? " placed" : ""}${
                  state === "solved" || state === "revealed" ? " done" : ""
                }`}
                onClick={() => tap(k)}
              >
                <span className="order-no" aria-hidden="true">
                  {pos >= 0 ? pos + 1 : ""}
                </span>
                <span className="order-text">{line.s}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {state === "solved" && <p className="verdict right">{t("pz.solved")}</p>}
      {state === "wrong" && <p className="verdict wrong">{t("c.wrong")}</p>}

      <div className="story-tools">
        {(state === "playing" || state === "wrong") && (
          <>
            <button
              type="button"
              className="btn btn-quiet btn-sm"
              onClick={() => {
                setChosen([]);
                setState("playing");
              }}
              disabled={!chosen.length}
            >
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
          // Solved within two tries counts; showing the answer does not.
          onClick={() => onDone(state === "solved" && tries <= 1, given)}
        >
          {t("c.next")}
        </button>
      )}
    </>
  );
}
