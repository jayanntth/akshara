/**
 * Learner proficiency prediction.
 *
 * Every piece of evidence (an assessment, a story finished, a letter marked
 * learned, a spoken line) is a noisy observation of a hidden skill level in
 * [0,1]. We combine them as a weighted posterior around a prior taken from
 * what the learner told Mira during onboarding:
 *
 *     estimate = (prior * k + SUM(weight_i * observed_i)) / (k + SUM(weight_i))
 *
 * k is the prior's strength in "equivalent observations". Older evidence is
 * worth less, on a 14-day half-life, so a learner who improves is not held
 * down by a bad first week.
 *
 * Confidence is reported separately from the estimate. A prediction resting
 * on one assessment should not be presented as if it rested on twenty.
 */

export const SKILLS = ["reading", "writing", "listening", "speaking", "comprehension"];

const HALF_LIFE_DAYS = 14;
const PRIOR_STRENGTH = 1.2;

/** Onboarding self-report to a starting estimate. */
const KNOWLEDGE_PRIOR = {
  none: 0.05,
  letters: 0.25,
  slow: 0.5,
  good: 0.75,
};

function decay(dateIso, now = Date.now()) {
  const then = new Date(dateIso).getTime();
  if (Number.isNaN(then)) return 0.5;
  const days = Math.max(0, (now - then) / 86_400_000);
  return Math.pow(0.5, days / HALF_LIFE_DAYS);
}

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Turns the raw activity log into per-skill observations.
 * Each observation is { skill, value 0..1, weight, date }.
 */
export function collectObservations(state) {
  const out = [];
  const { results = [], storyRuns = [], letters = [], speechRuns = [], langId } = state;

  for (const r of results) {
    if (r.language && langId && r.language !== langId) continue;
    const value = clamp01((r.score || 0) / 100);
    // A three-question assessment is thinner evidence than a ten-question one.
    const weight = Math.min(2, 0.6 + (r.total || 3) * 0.12);
    // Quiz and puzzle rounds are not skills of their own. The quiz mixes
    // letter recognition with story questions; the puzzles are matching and
    // spelling, so they land on reading and writing.
    if (r.type === "quiz") {
      out.push({ skill: "reading", value, weight, date: r.date });
      out.push({ skill: "comprehension", value, weight: weight * 0.5, date: r.date });
      continue;
    }
    if (r.type === "puzzle") {
      out.push({ skill: "writing", value, weight, date: r.date });
      out.push({ skill: "reading", value, weight: weight * 0.5, date: r.date });
      continue;
    }
    // v3.1 games: each one lands on the skill it actually exercises.
    if (r.type === "listen") {
      out.push({ skill: "listening", value, weight, date: r.date });
      out.push({ skill: "reading", value, weight: weight * 0.4, date: r.date });
      continue;
    }
    if (r.type === "sprint") {
      out.push({ skill: "reading", value, weight, date: r.date });
      continue;
    }
    if (r.type === "missing") {
      out.push({ skill: "writing", value, weight, date: r.date });
      out.push({ skill: "reading", value, weight: weight * 0.4, date: r.date });
      continue;
    }
    if (r.type === "order") {
      out.push({ skill: "comprehension", value, weight, date: r.date });
      out.push({ skill: "reading", value, weight: weight * 0.5, date: r.date });
      continue;
    }
    out.push({ skill: r.type || "reading", value, weight, date: r.date });
    // Reading and comprehension inform each other; the cross-signal is halved.
    if (r.type === "comprehension") out.push({ skill: "reading", value, weight: weight * 0.5, date: r.date });
    if (r.type === "reading") out.push({ skill: "comprehension", value, weight: weight * 0.4, date: r.date });
  }

  for (const s of storyRuns) {
    const value = clamp01(s.correct / Math.max(1, s.total));
    out.push({ skill: "comprehension", value, weight: 1, date: s.date });
    out.push({ skill: "reading", value, weight: 0.6, date: s.date });
    if (s.listened) out.push({ skill: "listening", value: clamp01(value * 0.9 + 0.1), weight: 0.5, date: s.date });
  }

  for (const sp of speechRuns) {
    out.push({ skill: "speaking", value: clamp01(sp.accuracy), weight: 0.8, date: sp.date });
    out.push({ skill: "listening", value: clamp01(sp.accuracy * 0.8 + 0.1), weight: 0.3, date: sp.date });
  }

  // Letters known is a direct, if coarse, reading signal.
  if (letters.length) {
    out.push({
      skill: "reading",
      value: clamp01(letters.length / 20),
      weight: 1.1,
      date: new Date().toISOString(),
    });
  }

  return out;
}

/**
 * @returns { skills: {skill: {estimate, confidence, n}}, overall, level, confidence }
 */
export function predictProficiency(state) {
  const prior = KNOWLEDGE_PRIOR[state.knowledge] ?? 0.15;
  const observations = collectObservations(state);
  const now = Date.now();

  const skills = {};
  for (const skill of SKILLS) {
    const relevant = observations.filter((o) => o.skill === skill);
    let weightSum = 0;
    let valueSum = 0;
    for (const o of relevant) {
      const w = o.weight * decay(o.date, now);
      weightSum += w;
      valueSum += w * o.value;
    }
    const estimate = (prior * PRIOR_STRENGTH + valueSum) / (PRIOR_STRENGTH + weightSum);
    // Confidence saturates: three solid observations is most of the way there.
    const confidence = clamp01(weightSum / (weightSum + 2.5));
    skills[skill] = {
      estimate: clamp01(estimate),
      confidence,
      n: relevant.length,
    };
  }

  // Reading and comprehension are what "proficiency" means for a script learner,
  // so the overall figure leans on them rather than averaging everything flat.
  const weights = { reading: 0.3, comprehension: 0.3, writing: 0.15, speaking: 0.15, listening: 0.1 };
  let overall = 0;
  for (const skill of SKILLS) overall += skills[skill].estimate * weights[skill];

  const confidence = SKILLS.reduce((sum, s) => sum + skills[s].confidence, 0) / SKILLS.length;

  return {
    skills,
    overall: clamp01(overall),
    level: levelFromEstimate(overall),
    confidence,
  };
}

export function levelFromEstimate(estimate) {
  if (estimate >= 0.8) return 4;
  if (estimate >= 0.6) return 3;
  if (estimate >= 0.35) return 2;
  return 1;
}

/** The skill with the most room to improve, ignoring ones we know nothing about. */
export function weakestSkill(prediction) {
  let worst = null;
  for (const skill of SKILLS) {
    const s = prediction.skills[skill];
    // A skill with no evidence at all is a gap in the record, not a weakness.
    const penalty = s.confidence < 0.15 ? 0.15 : 0;
    const score = s.estimate + penalty;
    if (!worst || score < worst.score) worst = { skill, score, ...s };
  }
  return worst;
}

export function strongestSkill(prediction) {
  let best = null;
  for (const skill of SKILLS) {
    const s = prediction.skills[skill];
    if (s.confidence < 0.15) continue;
    if (!best || s.estimate > best.estimate) best = { skill, ...s };
  }
  return best;
}

/**
 * Direction of travel over the recent record, used for the progress report.
 */
export function trend(state) {
  const events = [
    ...(state.results || []).map((r) => ({ date: r.date, value: (r.score || 0) / 100 })),
    ...(state.storyRuns || []).map((s) => ({ date: s.date, value: s.correct / Math.max(1, s.total) })),
  ]
    .filter((e) => e.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (events.length < 4) return "flat";
  const half = Math.floor(events.length / 2);
  const mean = (arr) => arr.reduce((s, e) => s + e.value, 0) / arr.length;
  const delta = mean(events.slice(half)) - mean(events.slice(0, half));
  if (delta > 0.08) return "up";
  if (delta < -0.08) return "down";
  return "flat";
}
