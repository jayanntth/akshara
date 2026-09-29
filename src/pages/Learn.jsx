import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../i18n/index.jsx";
import { useApp } from "../context/AppContext.jsx";
import { useSpeech, scorePronunciation } from "../hooks/useSpeech.js";
import { languageById } from "../data/languages.js";
import { storiesFor, storyById } from "../data/stories.js";
import { getContentRecommendations } from "../api/learningPathApi.js";
import StoryReader from "../components/StoryReader.jsx";

/**
 * Learn and practise (changes #2 and #3).
 *
 * Three tabs, and deliberately only three. Voice Studio used to be a separate
 * item in the top navigation, which meant speaking practice sat away from the
 * material being practised; it is now the "Say it" tab here, using the same
 * lines and the same script the learner is already working through.
 */
export default function Learn({ params, go }) {
  const { t } = useI18n();
  const { learner, prediction } = useApp();
  const [tab, setTab] = useState(params?.tab || "stories");
  const [openStoryId, setOpenStoryId] = useState(params?.storyId || null);

  useEffect(() => {
    if (params?.storyId) {
      setOpenStoryId(params.storyId);
      setTab("stories");
    } else if (params?.tab) {
      setTab(params.tab);
    }
  }, [params]);

  const story = openStoryId ? storyById(openStoryId) : null;

  return (
    <div className="page learn">
      <header className="page-head">
        <h1>{t("learn.title")}</h1>
        <p className="muted">{t("learn.sub")}</p>
      </header>

      {!story && (
        <div className="tabs" role="tablist">
          {[
            ["stories", "learn.tabStories"],
            ["letters", "learn.tabLetters"],
            ["speak", "learn.tabSpeak"],
          ].map(([id, key]) => (
            <button
              type="button"
              key={id}
              role="tab"
              aria-selected={tab === id}
              className={`tab${tab === id ? " active" : ""}`}
              onClick={() => setTab(id)}
            >
              {t(key)}
            </button>
          ))}
        </div>
      )}

      {story ? (
        <StoryReader story={story} onExit={() => setOpenStoryId(null)} />
      ) : tab === "stories" ? (
        <StoryPicker learner={learner} prediction={prediction} onOpen={setOpenStoryId} />
      ) : tab === "letters" ? (
        <Letters />
      ) : (
        <SayIt go={go} />
      )}
    </div>
  );
}

/* --------------------------------------------------------------- stories */

function StoryPicker({ learner, prediction, onOpen }) {
  const { t, uiLang } = useI18n();
  const stories = storiesFor(learner.langId);
  const readIds = new Set(learner.storyRuns.map((r) => r.storyId));

  // The content recommendation engine decides the order, so the story that
  // fits the learner's level and stated reason for learning comes first.
  const ranked = useMemo(() => {
    const scored = getContentRecommendations(learner, prediction, stories.length);
    const order = new Map(scored.map((s, i) => [s.story.id, i]));
    return [...stories].sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
  }, [learner, prediction, stories]);

  if (!stories.length) return <p className="muted">{t("learn.noStories")}</p>;

  return (
    <>
      <h2 className="section-label">{t("learn.pickStory")}</h2>
      <div className="story-grid">
        {ranked.map((s) => (
          <button type="button" key={s.id} className="story-card" onClick={() => onOpen(s.id)}>
            <span className="story-card-top">
              <span className="chip small">{t(["learn.easy", "learn.medium", "learn.hard"][s.level - 1])}</span>
              {readIds.has(s.id) && <span className="chip small done">{t("learn.storyRead")}</span>}
            </span>
            <strong lang={s.lang}>{s.title}</strong>
            <span className="muted">{s.gist[uiLang] || s.gist.en}</span>
            <span className="muted small">
              {s.minutes} {t("c.min")} &middot; {s.questions.length} Q
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

/* --------------------------------------------------------------- letters */

function Letters() {
  const { t } = useI18n();
  const { learner, toggleLetter } = useApp();
  const { speak, hasVoiceFor } = useSpeech();
  const lang = languageById(learner.langId);
  const voice = hasVoiceFor(learner.langId);

  return (
    <>
      <p className="muted">{t("learn.tapLetter")}</p>
      <p className="muted small">
        {t("learn.learned")}: {learner.letters.length} / {lang.letters.length}
      </p>
      <div className="letter-grid">
        {lang.letters.map((letter, index) => {
          const known = learner.letters.includes(index);
          return (
            <div className={`letter${known ? " known" : ""}`} key={letter.g + index}>
              <button
                type="button"
                className="letter-face"
                lang={learner.langId}
                onClick={() => speak(letter.g, learner.langId, { rate: 0.6 })}
                disabled={!voice}
              >
                <span className="glyph">{letter.g}</span>
                <span className="roman">{letter.r}</span>
              </button>
              <button
                type="button"
                className="letter-tick"
                aria-label={t("learn.learned")}
                aria-pressed={known}
                onClick={() => toggleLetter(index)}
              >
                ✓
              </button>
            </div>
          );
        })}
      </div>
      {!voice && <p className="muted small">{t("learn.noVoice")}</p>}
    </>
  );
}

/* ----------------------------------------------------------------- speak */

function SayIt() {
  const { t } = useI18n();
  const { learner, recordSpeechRun } = useApp();
  const { speak, listen, listening, hasVoiceFor, recognitionSupported, error } = useSpeech();
  const lang = languageById(learner.langId);

  const [lineIndex, setLineIndex] = useState(0);
  const [heard, setHeard] = useState(null);
  const [result, setResult] = useState(null);

  const line = lang.lines[lineIndex];
  const voice = hasVoiceFor(learner.langId);

  function start() {
    setHeard(null);
    setResult(null);
    listen(learner.langId, (best, alternatives) => {
      const scored = scorePronunciation(line, alternatives);
      setHeard(best);
      setResult(scored);
      recordSpeechRun({ line, accuracy: scored.accuracy, verdict: scored.verdict });
    });
  }

  return (
    <div className="card speak-card">
      <h2>{t("learn.speakTitle")}</h2>
      <p className="speak-line" lang={learner.langId}>
        {line}
      </p>

      <div className="story-tools">
        <button
          type="button"
          className="btn btn-quiet btn-sm"
          onClick={() => speak(line, learner.langId, { rate: 0.75 })}
          disabled={!voice}
        >
          {t("c.listen")}
        </button>
        <button
          type="button"
          className="btn btn-quiet btn-sm"
          onClick={() => {
            setLineIndex((i) => (i + 1) % lang.lines.length);
            setHeard(null);
            setResult(null);
          }}
        >
          {t("c.next")}
        </button>
      </div>

      <button
        type="button"
        className="btn btn-primary btn-wide mic"
        onClick={start}
        disabled={!recognitionSupported || listening}
      >
        {listening ? `${t("learn.listening")}…` : t("learn.speakStart")}
      </button>

      {!recognitionSupported && <p className="muted small">{t("learn.noSpeech")}</p>}
      {error === "denied" && <p className="error">{t("learn.noSpeech")}</p>}

      {result && (
        <div className="speak-result">
          <p className="muted small">
            {t("learn.youSaid")}: <span lang={learner.langId}>{heard}</span>
          </p>
          <div className="goal-track">
            <span className="goal-fill" style={{ width: `${Math.round(result.accuracy * 100)}%` }} />
          </div>
          <p className="score-line">
            {t("learn.accuracy")}: {Math.round(result.accuracy * 100)}%
          </p>
          <p className={`verdict ${result.verdict === "great" ? "right" : result.verdict === "ok" ? "" : "wrong"}`}>
            {t(
              result.verdict === "great"
                ? "learn.speakGreat"
                : result.verdict === "ok"
                ? "learn.speakOk"
                : "learn.speakPoor"
            )}
          </p>
          <button type="button" className="btn btn-quiet btn-sm" onClick={start}>
            {t("c.tryAgain")}
          </button>
        </div>
      )}
    </div>
  );
}
