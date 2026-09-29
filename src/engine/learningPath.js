/**
 * Learning path construction.
 *
 * The learner tells Mira how many weeks they want and how many minutes a day
 * they can give. That budget, not a fixed syllabus, decides how much content
 * lands in each week. The phase mix shifts as the weeks go on - early weeks
 * lean on letters, later weeks on stories and fluency - and the phase the
 * learner starts in depends on what they already know.
 */

import { storiesFor } from "../data/stories.js";
import { levelFromEstimate } from "./proficiency.js";

const PHASES = [
  { id: "foundation", key: "path.w.foundation", letters: 0.6, stories: 0.2, speak: 0.1, assess: 0.1 },
  { id: "words", key: "path.w.words", letters: 0.35, stories: 0.35, speak: 0.15, assess: 0.15 },
  { id: "stories", key: "path.w.stories", letters: 0.15, stories: 0.5, speak: 0.2, assess: 0.15 },
  { id: "fluency", key: "path.w.fluency", letters: 0.05, stories: 0.5, speak: 0.3, assess: 0.15 },
];

/** Where in the phase ladder a learner starts, from their self-report. */
const START_PHASE = { none: 0, letters: 0, slow: 1, good: 2 };

export function buildLearningPath(state, prediction) {
  const weeks = Math.max(1, state.weeks || 4);
  const minutesPerDay = state.minutesPerDay || 10;
  const weeklyMinutes = minutesPerDay * 6; // one rest day assumed, not punished
  const storyCount = storiesFor(state.langId).length;

  const start = START_PHASE[state.knowledge] ?? 0;
  // The learner's measured level can push them past their self-report.
  const measured = levelFromEstimate(prediction?.overall ?? 0) - 1;
  const effectiveStart = Math.max(start, Math.min(measured, PHASES.length - 1));

  const plan = [];
  for (let w = 0; w < weeks; w++) {
    const progressRatio = weeks === 1 ? 1 : w / (weeks - 1);
    const phaseIndex = Math.min(
      PHASES.length - 1,
      effectiveStart + Math.round(progressRatio * (PHASES.length - 1 - effectiveStart))
    );
    const phase = PHASES[phaseIndex];

    const activities = [];
    const lettersMinutes = weeklyMinutes * phase.letters;
    const storyMinutes = weeklyMinutes * phase.stories;
    const speakMinutes = weeklyMinutes * phase.speak;
    const assessMinutes = weeklyMinutes * phase.assess;

    // Roughly 90 seconds to get a letter into memory, 4 minutes to read a story.
    const letters = Math.round(lettersMinutes / 1.5);
    const stories = Math.max(phase.stories > 0.3 ? 1 : 0, Math.round(storyMinutes / 4));
    const speak = Math.max(phase.speak > 0.1 ? 1 : 0, Math.round(speakMinutes / 2));
    const assess = assessMinutes >= 8 ? 1 : 0;

    if (letters > 0) activities.push({ kind: "letters", key: "path.act.letters", n: letters });
    if (stories > 0) activities.push({ kind: "story", key: "path.act.story", n: Math.min(stories, storyCount) });
    if (speak > 0) activities.push({ kind: "speak", key: "path.act.speak", n: speak });
    if (assess > 0) activities.push({ kind: "assess", key: "path.act.assess", n: assess });

    plan.push({
      week: w + 1,
      phaseId: phase.id,
      focusKey: phase.key,
      minutesPerDay,
      activities,
    });
  }

  return {
    weeks,
    minutesPerDay,
    langId: state.langId,
    createdAt: new Date().toISOString(),
    plan,
  };
}

/**
 * Which week the learner is actually on, from the date they started rather
 * than from how much they have done. Kept honest: falling behind shows as
 * falling behind rather than silently rescheduling the plan.
 */
export function currentWeek(path, startedAt) {
  if (!path || !startedAt) return 1;
  const elapsed = (Date.now() - new Date(startedAt).getTime()) / 86_400_000;
  return Math.min(path.weeks, Math.max(1, Math.floor(elapsed / 7) + 1));
}
