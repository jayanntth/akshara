/**
 * XP, streaks and badges.
 *
 * XP is awarded for finishing things, not for opening them, and a wrong answer
 * still earns a little - the aim is to reward turning up, without making the
 * number meaningless.
 */

export const XP = {
  storyQuestion: 10,
  storyComplete: 25,
  letterLearned: 5,
  assessmentComplete: 40,
  speechAttempt: 8,
  speechClear: 15,
};

export function totalXp(state) {
  const { storyRuns = [], letters = [], results = [], speechRuns = [] } = state;
  let xp = 0;
  for (const run of storyRuns) xp += XP.storyComplete + run.correct * XP.storyQuestion;
  xp += letters.length * XP.letterLearned;
  xp += results.length * XP.assessmentComplete;
  for (const s of speechRuns) xp += s.accuracy >= 0.8 ? XP.speechClear : XP.speechAttempt;
  return xp;
}

/** Distinct days on which the learner did something, most recent first. */
export function activeDays(state) {
  const dates = new Set();
  const add = (d) => {
    if (!d) return;
    const key = new Date(d).toISOString().slice(0, 10);
    if (key !== "Invalid Date") dates.add(key);
  };
  (state.storyRuns || []).forEach((s) => add(s.date));
  (state.results || []).forEach((r) => add(r.date));
  (state.speechRuns || []).forEach((s) => add(s.date));
  (state.letterDates || []).forEach(add);
  return [...dates].sort().reverse();
}

/**
 * Consecutive days ending today or yesterday. Ending yesterday still counts,
 * so a learner who practises at 11pm and then at 1am the next night does not
 * lose the run on a technicality.
 */
export function currentStreak(state) {
  const days = activeDays(state);
  if (!days.length) return 0;

  const dayMs = 86_400_000;
  const todayKey = new Date().toISOString().slice(0, 10);
  const yesterdayKey = new Date(Date.now() - dayMs).toISOString().slice(0, 10);
  if (days[0] !== todayKey && days[0] !== yesterdayKey) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]).getTime();
    const cur = new Date(days[i]).getTime();
    if (Math.round((prev - cur) / dayMs) === 1) streak++;
    else break;
  }
  return streak;
}

export const BADGES = [
  { id: "firstStory",  nameKey: "ach.b.firstStory",  hintKey: "ach.h.firstStory",  icon: "book",   test: (s) => (s.storyRuns || []).length >= 1 },
  { id: "fiveStories", nameKey: "ach.b.fiveStories", hintKey: "ach.h.fiveStories", icon: "books",  test: (s) => (s.storyRuns || []).length >= 5 },
  { id: "tenLetters",  nameKey: "ach.b.tenLetters",  hintKey: "ach.h.tenLetters",  icon: "letter", test: (s) => (s.letters || []).length >= 10 },
  { id: "allLetters",  nameKey: "ach.b.allLetters",  hintKey: "ach.h.allLetters",  icon: "crown",  test: (s) => (s.letters || []).length >= 20 },
  { id: "firstAssess", nameKey: "ach.b.firstAssess", hintKey: "ach.h.firstAssess", icon: "check",  test: (s) => (s.results || []).length >= 1 },
  { id: "perfect",     nameKey: "ach.b.perfect",     hintKey: "ach.h.perfect",     icon: "star",   test: (s) => (s.results || []).some((r) => r.score === 100) },
  { id: "streak3",     nameKey: "ach.b.streak3",     hintKey: "ach.h.streak3",     icon: "flame",  test: (s) => currentStreak(s) >= 3 },
  { id: "streak7",     nameKey: "ach.b.streak7",     hintKey: "ach.h.streak7",     icon: "flame",  test: (s) => currentStreak(s) >= 7 },
  { id: "speaker",     nameKey: "ach.b.speaker",     hintKey: "ach.h.speaker",     icon: "mic",    test: (s) => (s.speechRuns || []).some((x) => x.accuracy >= 0.8) },
];

export function evaluateBadges(state) {
  return BADGES.map((b) => ({ ...b, unlocked: Boolean(b.test(state)) }));
}

/** Minutes of work done today, used against the learner's daily goal. */
export function minutesToday(state) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const onToday = (d) => d && new Date(d).toISOString().slice(0, 10) === todayKey;
  let minutes = 0;
  for (const run of state.storyRuns || []) if (onToday(run.date)) minutes += run.minutes || 4;
  for (const r of state.results || []) if (onToday(r.date)) minutes += 5;
  for (const s of state.speechRuns || []) if (onToday(s.date)) minutes += 2;
  for (const d of state.letterDates || []) if (onToday(d)) minutes += 1;
  return minutes;
}
