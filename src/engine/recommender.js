/**
 * Adaptive learning recommendation + content recommendation engine.
 *
 * Every candidate activity is scored on the same five terms, so the ranking is
 * explainable: the term that contributed most becomes the "why this" line the
 * learner sees. Nothing here is random, and nothing is hardcoded to a fixed
 * order, which is the whole point of calling it adaptive.
 *
 *   gap        how weak the skill this activity trains currently is
 *   fit        how close the item's difficulty is to the learner's level
 *   theme      does it match the reason they gave for learning
 *   novelty    have they already done it
 *   urgency    streak protection, stale skills, missing evidence
 */

import { storiesFor } from "../data/stories.js";
import { levelFromEstimate, weakestSkill } from "./proficiency.js";

const SKILL_OF = {
  story: "comprehension",
  letters: "reading",
  assessReading: "reading",
  assessWriting: "writing",
  assessComprehension: "comprehension",
  speak: "speaking",
};

function daysSince(dateIso) {
  if (!dateIso) return 999;
  const d = (Date.now() - new Date(dateIso).getTime()) / 86_400_000;
  return Number.isNaN(d) ? 999 : d;
}

/**
 * @returns array of { id, kind, payload, score, reasonKey, reasonVars }
 *          sorted best first.
 */
export function recommend(state, prediction, limit = 4) {
  const { langId, goal, storyRuns = [], letters = [], results = [], speechRuns = [] } = state;
  const weakest = weakestSkill(prediction);
  const learnerLevel = levelFromEstimate(prediction.overall);
  const readStoryIds = new Set(storyRuns.map((s) => s.storyId));
  const candidates = [];

  const gapOf = (skill) => 1 - prediction.skills[skill].estimate;

  // ------------------------------------------------------------- stories
  for (const story of storiesFor(langId)) {
    const skill = SKILL_OF.story;
    const gap = gapOf(skill);
    // Difficulty fit peaks when story level sits just at or one above the learner.
    const distance = Math.abs(story.level - learnerLevel);
    const fit = distance === 0 ? 1 : distance === 1 ? 0.7 : 0.25;
    const theme = goal && story.theme === goal ? 1 : 0;
    const novelty = readStoryIds.has(story.id) ? 0 : 1;

    const terms = {
      gap: gap * 0.9,
      fit: fit * 1.0,
      theme: theme * 0.5,
      novelty: novelty * 0.8,
      urgency: 0,
    };
    candidates.push(makeCandidate(`story:${story.id}`, "story", { story }, terms, {
      gap: { key: "reco.r.weak", vars: { skill: "skill.comprehension" } },
      fit: { key: "reco.r.level" },
      theme: { key: "reco.r.theme" },
      novelty: { key: "reco.r.new" },
    }));
  }

  // ------------------------------------------------------------- letters
  {
    const remaining = 20 - letters.length;
    if (remaining > 0) {
      const gap = gapOf("reading");
      const toNextLevel = [6, 12, 20].find((n) => letters.length < n);
      const terms = {
        gap: gap * 1.0,
        fit: letters.length < 12 ? 0.9 : 0.5,
        theme: 0,
        novelty: 0.4,
        urgency: toNextLevel && toNextLevel - letters.length <= 3 ? 0.9 : 0.2,
      };
      candidates.push(
        makeCandidate("letters", "letters", { remaining }, terms, {
          gap: { key: "reco.r.weak", vars: { skill: "skill.reading" } },
          fit: { key: "reco.r.level" },
          urgency: { key: "reco.r.letters", vars: { n: toNextLevel ? toNextLevel - letters.length : remaining } },
          novelty: { key: "reco.r.new" },
        })
      );
    }
  }

  // --------------------------------------------------------- assessments
  for (const type of ["reading", "writing", "comprehension"]) {
    const taken = results.filter((r) => r.type === type && r.language === langId);
    const last = taken[0]?.date;
    const stale = daysSince(last);
    const terms = {
      gap: gapOf(type) * 0.7,
      fit: 0.5,
      theme: 0,
      novelty: taken.length === 0 ? 0.6 : 0.1,
      // An untested skill leaves the prediction guessing, so it is worth prompting.
      urgency: taken.length === 0 ? 1.0 : stale > 10 ? 0.6 : 0,
    };
    candidates.push(
      makeCandidate(`assess:${type}`, "assess", { type }, terms, {
        gap: { key: "reco.r.weak", vars: { skill: `skill.${type}` } },
        urgency: taken.length === 0 ? { key: "reco.r.noAssess" } : { key: "reco.r.stale" },
        novelty: { key: "reco.r.new" },
        fit: { key: "reco.r.level" },
      })
    );
  }

  // -------------------------------------------------------------- speech
  {
    const stale = daysSince(speechRuns[0]?.date);
    const terms = {
      gap: gapOf("speaking") * 0.8,
      fit: 0.6,
      theme: goal === "work" || goal === "travel" ? 0.4 : 0,
      novelty: speechRuns.length === 0 ? 0.5 : 0.1,
      urgency: stale > 7 ? 0.7 : 0,
    };
    candidates.push(
      makeCandidate("speak", "speak", {}, terms, {
        gap: { key: "reco.r.weak", vars: { skill: "skill.speaking" } },
        urgency: { key: "reco.r.speak" },
        theme: { key: "reco.r.theme" },
        fit: { key: "reco.r.level" },
      })
    );
  }

  candidates.sort((a, b) => b.score - a.score);

  // Avoid handing back four variations of the same thing.
  const seenKinds = new Map();
  const picked = [];
  for (const c of candidates) {
    const count = seenKinds.get(c.kind) || 0;
    if (count >= 2) continue;
    seenKinds.set(c.kind, count + 1);
    picked.push(c);
    if (picked.length >= limit) break;
  }
  return picked;
}

function makeCandidate(id, kind, payload, terms, reasons) {
  const score = Object.values(terms).reduce((a, b) => a + b, 0);
  // The dominant term explains the pick.
  let topTerm = null;
  for (const [name, value] of Object.entries(terms)) {
    if (!reasons[name]) continue;
    if (!topTerm || value > topTerm.value) topTerm = { name, value };
  }
  const reason = topTerm ? reasons[topTerm.name] : { key: "reco.r.level" };
  return {
    id,
    kind,
    payload,
    score,
    terms,
    reasonKey: reason.key,
    reasonVars: reason.vars || null,
  };
}

/**
 * Content recommendation engine: ranks the story library alone, for the
 * "more like this" strip. Kept separate from `recommend` because it answers a
 * different question - not "what next", but "what else of this kind".
 */
export function recommendContent(state, prediction, limit = 3) {
  const { langId, goal, storyRuns = [] } = state;
  const readIds = new Set(storyRuns.map((s) => s.storyId));
  const learnerLevel = levelFromEstimate(prediction.overall);

  return storiesFor(langId)
    .map((story) => {
      const distance = Math.abs(story.level - learnerLevel);
      const score =
        (distance === 0 ? 1 : distance === 1 ? 0.6 : 0.2) +
        (goal && story.theme === goal ? 0.5 : 0) +
        (readIds.has(story.id) ? -0.6 : 0.4);
      return { story, score, read: readIds.has(story.id) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
