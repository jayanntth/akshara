/**
 * Personalized lesson generation.
 *
 * Assembles a four-step lesson from the learner's actual gaps rather than
 * pulling a fixed lesson off a shelf: the warm-up uses letters they have not
 * marked as learned, the reading step uses a story at their level that they
 * have not read, the check reuses a question they previously got wrong where
 * one exists, and the closing step targets the weakest skill.
 *
 * Deterministic for a given (state, seed) so a learner who reloads the page
 * gets the lesson back rather than a different one.
 */

import { languageById } from "../data/languages.js";
import { storiesFor } from "../data/stories.js";
import { levelFromEstimate, weakestSkill } from "./proficiency.js";

function seededPick(arr, seed, count) {
  if (!arr.length) return [];
  const out = [];
  let s = seed || 1;
  const pool = [...arr];
  while (out.length < Math.min(count, arr.length) && pool.length) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const idx = Math.abs(s) % pool.length;
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

export function generateLesson(state, prediction, seed = 1) {
  const lang = languageById(state.langId);
  const learnedSet = new Set(state.letters || []);
  const unlearned = lang.letters
    .map((letter, index) => ({ ...letter, index }))
    .filter((l) => !learnedSet.has(l.index));

  const learnerLevel = levelFromEstimate(prediction.overall);
  const readIds = new Set((state.storyRuns || []).map((s) => s.storyId));
  const pool = storiesFor(state.langId);
  const unread = pool.filter((s) => !readIds.has(s.id));
  const byFit = (list) =>
    [...list].sort(
      (a, b) => Math.abs(a.level - learnerLevel) - Math.abs(b.level - learnerLevel)
    );
  const story = byFit(unread.length ? unread : pool)[0] || null;

  const weak = weakestSkill(prediction);

  // A question the learner has actually missed is worth more than a fresh one.
  const missed = [];
  for (const run of state.storyRuns || []) {
    for (const wrong of run.wrong || []) missed.push(wrong);
  }
  const revision = missed.length ? seededPick(missed, seed, 1)[0] : null;

  const steps = [
    {
      id: "warm",
      kind: "letters",
      titleKey: "gen.step.warm",
      letters: seededPick(unlearned, seed, 4),
    },
    {
      id: "read",
      kind: "story",
      titleKey: "gen.step.read",
      story,
    },
    {
      id: "check",
      kind: revision ? "revision" : "questions",
      titleKey: "gen.step.check",
      revision,
      story,
    },
    {
      id: "say",
      kind: "speak",
      titleKey: "gen.step.say",
      line: lang.lines[Math.abs(seed) % lang.lines.length],
    },
  ].filter((step) => {
    if (step.kind === "letters") return step.letters.length > 0;
    if (step.kind === "story" || step.kind === "questions") return Boolean(step.story);
    return true;
  });

  const minutes = steps.reduce(
    (total, step) => total + (step.kind === "story" ? step.story?.minutes || 4 : 2),
    0
  );

  return {
    id: `gen-${state.langId}-${seed}`,
    focusSkill: weak?.skill || "reading",
    level: learnerLevel,
    minutes,
    steps,
    generatedAt: new Date().toISOString(),
  };
}
