/**
 * Learning path management API.
 *
 * The engine modules are pure functions; this file is the service boundary
 * around them. It is the seam a Django backend would slot into, so the
 * endpoint each call maps to is written above it.
 *
 *   GET   /api/learners/:id/path/              getPath
 *   POST  /api/learners/:id/path/              createPath
 *   PATCH /api/learners/:id/path/              rebuildPath
 *   GET   /api/learners/:id/recommendations/   getRecommendations
 *   POST  /api/learners/:id/lessons/generate/  getGeneratedLesson
 *   GET   /api/learners/:id/report/            getReport
 *   GET   /api/learners/:id/proficiency/       getProficiency
 */

import { load, save } from "./storage.js";
import { buildLearningPath, currentWeek } from "../engine/learningPath.js";
import { generateLesson } from "../engine/lessonGenerator.js";
import { predictProficiency } from "../engine/proficiency.js";
import { recommend, recommendContent } from "../engine/recommender.js";
import { buildReport } from "../engine/reports.js";

const KEY = "akshara.paths";

const readAll = () => load(KEY, {}) || {};

/**
 * The answers a plan was sized from. Stored alongside the plan so the app can
 * tell "this plan is still the right shape" from "the learner changed their
 * mind about how long they have", without diffing the whole structure.
 */
export function planSignature(state) {
  return `${state.langId}|${state.weeks}|${state.minutesPerDay}|${state.knowledge}`;
}

/** GET /api/learners/:id/path/ */
export function getPath(learnerId) {
  return readAll()[learnerId] || null;
}

/** POST /api/learners/:id/path/ */
export function createPath(learnerId, state, prediction) {
  const all = readAll();
  const path = buildLearningPath(state, prediction);
  all[learnerId] = {
    ...path,
    signature: planSignature(state),
    startedAt: all[learnerId]?.startedAt || new Date().toISOString(),
  };
  save(KEY, all);
  return all[learnerId];
}

/**
 * PATCH /api/learners/:id/path/
 * Rebuilds the weekly breakdown against current results while keeping the
 * original start date, so "week 3 of 8" stays honest.
 */
export function rebuildPath(learnerId, state, prediction) {
  const all = readAll();
  const existing = all[learnerId];
  const path = buildLearningPath(state, prediction);
  all[learnerId] = {
    ...path,
    signature: planSignature(state),
    startedAt: existing?.startedAt || new Date().toISOString(),
  };
  save(KEY, all);
  return all[learnerId];
}

export function pathPosition(learnerId) {
  const path = getPath(learnerId);
  if (!path) return { week: 1, total: 1 };
  return { week: currentWeek(path, path.startedAt), total: path.weeks };
}

/** GET /api/learners/:id/proficiency/ */
export function getProficiency(state) {
  return predictProficiency(state);
}

/** GET /api/learners/:id/recommendations/ */
export function getRecommendations(state, prediction, limit) {
  return recommend(state, prediction, limit);
}

export function getContentRecommendations(state, prediction, limit) {
  return recommendContent(state, prediction, limit);
}

/** POST /api/learners/:id/lessons/generate/ */
export function getGeneratedLesson(state, prediction, seed) {
  return generateLesson(state, prediction, seed);
}

/** GET /api/learners/:id/report/ */
export function getReport(state, prediction) {
  return buildReport(state, prediction);
}
