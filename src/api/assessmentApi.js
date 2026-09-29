/**
 * Assessment API.
 *
 * Same function names and shapes as the original prototype, so the swap to a
 * Django REST backend stays a one-file change. Each function below has the
 * endpoint it maps to written above it; replace the body with fetch() and the
 * rest of the app does not move.
 *
 *   POST /api/assessments/attempts/            startAssessment
 *   GET  /api/assessments/:id/questions/       fetchQuestions
 *   POST /api/assessments/responses/           submitAnswer
 *   POST /api/assessments/results/             saveResult
 *   GET  /api/learners/:id/performance/        retrieveLearnerPerformance
 */

import { load, save, uid } from "./storage.js";

const KEY = "akshara.assessment";

const empty = { attempts: [], responses: [], results: [] };
const read = () => load(KEY, empty) || empty;
const write = (db) => save(KEY, db);

/** POST /api/assessments/attempts/ */
export function startAssessment({ learnerId, assessmentId }) {
  const db = read();
  const previous = db.attempts.filter(
    (a) => a.learnerId === learnerId && a.assessmentId === assessmentId
  ).length;
  const attempt = {
    id: uid(),
    learnerId,
    assessmentId,
    attemptNumber: previous + 1,
    startedAt: new Date().toISOString(),
    completed: false,
  };
  db.attempts.push(attempt);
  write(db);
  return attempt;
}

/** GET /api/assessments/:id/questions/ */
export function fetchQuestions(questions = []) {
  return questions;
}

/** POST /api/assessments/responses/ */
export function submitAnswer({ attemptId, learnerId, questionId, learnerAnswer, correctAnswer, score }) {
  const db = read();
  const response = {
    id: uid(),
    attemptId,
    learnerId,
    questionId,
    learnerAnswer,
    correctAnswer,
    score,
    attempts: 1,
    answeredAt: new Date().toISOString(),
  };
  db.responses.push(response);
  write(db);
  return response;
}

/** Scoring stays client-side so a learner offline still sees their result. */
export function calculateResult(responses = []) {
  const total = responses.length || 1;
  const correct = responses.filter((r) => Number(r.score) === 1).length;
  const score = Math.round((correct / total) * 100);
  const proficiency = score >= 85 ? 4 : score >= 65 ? 3 : score >= 40 ? 2 : 1;
  return { score, proficiency, correct, total };
}

/** POST /api/assessments/results/ */
export function saveResult(result) {
  const db = read();
  const stored = { id: uid(), ...result };
  db.results.unshift(stored);
  const attempt = db.attempts.find((a) => a.id === result.attemptId);
  if (attempt) attempt.completed = true;
  write(db);
  return stored;
}

/** GET /api/learners/:id/performance/ */
export function retrieveLearnerPerformance(learnerId) {
  const db = read();
  return {
    attempts: db.attempts.filter((a) => a.learnerId === learnerId),
    responses: db.responses.filter((r) => r.learnerId === learnerId),
    results: db.results.filter((r) => r.learnerId === learnerId),
  };
}

export function attemptCount(learnerId, assessmentId) {
  return read().attempts.filter(
    (a) => a.learnerId === learnerId && a.assessmentId === assessmentId
  ).length;
}
