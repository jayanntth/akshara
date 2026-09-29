import { useRef, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  calculateResult,
  saveResult,
  startAssessment,
  submitAnswer,
} from "../api/assessmentApi.js";

/**
 * Shared plumbing for the v3.1 games.
 *
 * Every game goes through the same assessment API as the skill tests: one
 * attempt, one response per question (question, given answer, correct answer,
 * score), then a stored result. Keeping it in one hook means a new game cannot
 * forget a step and quietly drop out of the proficiency model.
 */
export function useGameRecorder(type) {
  const { learner, recordResult } = useApp();
  const [attempt] = useState(() =>
    startAssessment({ learnerId: learner.email, assessmentId: `${type}:${learner.langId}` })
  );
  const responses = useRef([]);
  const [finished, setFinished] = useState(null);

  function record(questionId, given, correct, ok) {
    responses.current.push(
      submitAnswer({
        attemptId: attempt.id,
        learnerId: learner.email,
        questionId,
        learnerAnswer: String(given ?? ""),
        correctAnswer: String(correct ?? ""),
        score: ok ? 1 : 0,
      })
    );
  }

  function finish() {
    const result = calculateResult(responses.current);
    const rec = {
      type,
      language: learner.langId,
      score: result.score,
      correct: result.correct,
      total: result.total,
      proficiency: result.proficiency,
      attemptId: attempt.id,
    };
    saveResult({ ...rec, learnerId: learner.email, date: new Date().toISOString() });
    recordResult(rec);
    setFinished(result);
    return result;
  }

  return { record, finish, finished, answered: () => responses.current.length };
}

export function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
