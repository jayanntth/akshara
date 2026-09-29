/**
 * Learning reports and improvement recommendations.
 *
 * Turns the raw log into the three things a learner actually wants from a
 * progress screen: what did I do, is it working, and what should I fix.
 * Advice is returned as translation keys so the report reads in whichever
 * language the learner chose.
 */

import { SKILLS, strongestSkill, trend, weakestSkill } from "./proficiency.js";

function withinDays(dateIso, days) {
  if (!dateIso) return false;
  const delta = (Date.now() - new Date(dateIso).getTime()) / 86_400_000;
  return delta >= 0 && delta <= days;
}

/** Advice keyed to the weakest skill, with a fallback when nothing is weak. */
const ADVICE_FOR_SKILL = {
  reading: "rep.adv.reading",
  comprehension: "rep.adv.comprehension",
  speaking: "rep.adv.speaking",
  writing: "rep.adv.writing",
  listening: "rep.adv.listening",
};

export function buildReport(state, prediction) {
  const window = 7;
  const storyRuns = state.storyRuns || [];
  const results = state.results || [];
  const speechRuns = state.speechRuns || [];

  const week = {
    stories: storyRuns.filter((s) => withinDays(s.date, window)).length,
    assessments: results.filter((r) => withinDays(r.date, window)).length,
    speech: speechRuns.filter((s) => withinDays(s.date, window)).length,
    minutes: storyRuns
      .filter((s) => withinDays(s.date, window))
      .reduce((total, s) => total + (s.minutes || 4), 0),
  };

  const totalEvidence = storyRuns.length + results.length + speechRuns.length;
  const strong = strongestSkill(prediction);
  const weak = weakestSkill(prediction);
  const direction = trend(state);

  const advice = [];
  if (totalEvidence === 0) {
    advice.push({ key: "rep.adv.start" });
  } else {
    if (weak) advice.push({ key: ADVICE_FOR_SKILL[weak.skill] || "rep.adv.keep" });
    // A prediction resting on almost nothing is worth calling out directly.
    if (prediction.confidence < 0.3) advice.push({ key: "rep.adv.moreEvidence" });
    if (week.stories === 0 && totalEvidence > 0) advice.push({ key: "rep.adv.comeBack" });
    if (direction === "up") advice.push({ key: "rep.adv.keep" });
  }

  return {
    week,
    strong: strong ? strong.skill : null,
    weak: weak ? weak.skill : null,
    direction,
    advice: advice.slice(0, 3),
    skillBars: SKILLS.map((skill) => ({
      skill,
      value: prediction.skills[skill].estimate,
      confidence: prediction.skills[skill].confidence,
    })),
  };
}
