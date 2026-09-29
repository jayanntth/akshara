import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { load, save, remove } from "../api/storage.js";
import { predictProficiency } from "../engine/proficiency.js";
import { createPath, getPath, pathPosition, planSignature, rebuildPath } from "../api/learningPathApi.js";
import { currentStreak, minutesToday, totalXp } from "../engine/gamification.js";

const AppContext = createContext(null);

const SESSION_KEY = "akshara.session";
const ACCOUNTS_KEY = "akshara.accounts";
const LEARNERS_KEY = "akshara.learners";

/** A fresh learner record. Onboarding fills in the nulls. */
function blankLearner(email, name) {
  return {
    email,
    name,
    onboarded: false,
    uiLang: null,
    langId: null,
    knowledge: null,
    weeks: null,
    minutesPerDay: null,
    goal: null,
    style: null,
    letters: [],       // indices into the current script's letter list
    letterDates: [],
    storyRuns: [],     // { storyId, correct, total, wrong[], date, minutes, listened }
    speechRuns: [],    // { line, accuracy, date }
    results: [],       // { type, score, total, correct, language, date, responses[] }
    createdAt: new Date().toISOString(),
  };
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => load(SESSION_KEY, null));
  const [learners, setLearners] = useState(() => load(LEARNERS_KEY, {}) || {});

  // Braces matter here. `save()` returns true, and an arrow without braces
  // hands that back to React as the effect's cleanup. React then calls
  // `true()` on the next change - which is what blanked the screen after
  // sign-in and after onboarding in v2.
  useEffect(() => {
    save(LEARNERS_KEY, learners);
  }, [learners]);

  const learner = user ? learners[user.email] || blankLearner(user.email, user.name) : null;

  const patchLearner = useCallback(
    (patch) => {
      if (!user) return;
      setLearners((prev) => {
        const current = prev[user.email] || blankLearner(user.email, user.name);
        const next = typeof patch === "function" ? patch(current) : { ...current, ...patch };
        return { ...prev, [user.email]: next };
      });
    },
    [user]
  );

  /* ------------------------------------------------------------ auth */

  // Both auth calls take the two languages picked on the login screen, so a
  // learner's record carries them from the first moment it exists.
  const register = useCallback(({ name, email, password, uiLang, langId }) => {
    const accounts = load(ACCOUNTS_KEY, {}) || {};
    const key = email.trim().toLowerCase();
    if (accounts[key]) return { ok: false, error: "auth.errExists" };
    accounts[key] = { name, email: key, password };
    save(ACCOUNTS_KEY, accounts);

    const session = { name, email: key };
    setUser(session);
    save(SESSION_KEY, session);
    setLearners((prev) => ({
      ...prev,
      [key]: { ...blankLearner(key, name), uiLang: uiLang || null, langId: langId || null },
    }));
    return { ok: true, fresh: true };
  }, []);

  const login = useCallback(({ email, password, uiLang, langId }) => {
    const accounts = load(ACCOUNTS_KEY, {}) || {};
    const key = email.trim().toLowerCase();
    const account = accounts[key];
    if (!account || account.password !== password) return { ok: false, error: "auth.errWrong" };
    const session = { name: account.name, email: key };
    // Languages chosen on the login screen win over whatever was saved last
    // time - the learner just told us what they want today.
    setLearners((prev) => {
      const current = prev[key] || blankLearner(key, account.name);
      return {
        ...prev,
        [key]: {
          ...current,
          uiLang: uiLang || current.uiLang,
          langId: langId || current.langId,
        },
      };
    });
    setUser(session);
    save(SESSION_KEY, session);
    return { ok: true, fresh: !(load(LEARNERS_KEY, {}) || {})[key]?.onboarded };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    remove(SESSION_KEY);
  }, []);

  /* ------------------------------------------- activity recording */

  const toggleLetter = useCallback(
    (index) => {
      patchLearner((current) => {
        const has = current.letters.includes(index);
        return {
          ...current,
          letters: has ? current.letters.filter((i) => i !== index) : [...current.letters, index],
          letterDates: has ? current.letterDates : [...current.letterDates, new Date().toISOString()],
        };
      });
    },
    [patchLearner]
  );

  const recordStoryRun = useCallback(
    (run) => {
      patchLearner((current) => ({
        ...current,
        storyRuns: [{ ...run, date: new Date().toISOString() }, ...current.storyRuns],
      }));
    },
    [patchLearner]
  );

  const recordSpeechRun = useCallback(
    (run) => {
      patchLearner((current) => ({
        ...current,
        speechRuns: [{ ...run, date: new Date().toISOString() }, ...current.speechRuns],
      }));
    },
    [patchLearner]
  );

  const recordResult = useCallback(
    (result) => {
      patchLearner((current) => ({
        ...current,
        results: [{ ...result, date: new Date().toISOString() }, ...current.results],
      }));
    },
    [patchLearner]
  );

  const completeOnboarding = useCallback(
    (answers) => {
      patchLearner((current) => ({ ...current, ...answers, onboarded: true }));
    },
    [patchLearner]
  );

  const resetOnboarding = useCallback(() => {
    patchLearner({ onboarded: false });
  }, [patchLearner]);

  /* --------------------------------------------------- derived state */

  const prediction = useMemo(
    () => predictProficiency(learner || { knowledge: "none" }),
    [learner]
  );

  const stats = useMemo(() => {
    if (!learner) return { xp: 0, streak: 0, minutesToday: 0 };
    return {
      xp: totalXp(learner),
      streak: currentStreak(learner),
      minutesToday: minutesToday(learner),
    };
  }, [learner]);

  // The stored path lives in localStorage, so a counter in state is what tells
  // React that it changed. Without it the dashboard would keep rendering the
  // path it read before onboarding wrote one.
  const [pathVersion, setPathVersion] = useState(0);

  // The path is built once onboarding finishes, and rebuilt only when one of
  // the answers it was sized from changes - not on every render, which would
  // make "week 3 of 8" jump around while the learner reads it.
  const signature = learner?.onboarded ? planSignature(learner) : null;

  useEffect(() => {
    if (!signature || !user) return;
    const existing = getPath(user.email);
    if (!existing) {
      createPath(user.email, learner, prediction);
    } else if (existing.signature !== signature) {
      rebuildPath(user.email, learner, prediction);
    } else {
      return;
    }
    setPathVersion((v) => v + 1);
    // `learner` and `prediction` are read inside, but re-running on every
    // prediction nudge would rebuild the plan after each answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, user]);

  const refreshPath = useCallback(() => {
    if (!user || !learner) return null;
    const next = rebuildPath(user.email, learner, prediction);
    setPathVersion((v) => v + 1);
    return next;
  }, [user, learner, prediction]);

  const value = useMemo(
    () => ({
      user,
      learner,
      prediction,
      stats,
      register,
      login,
      logout,
      patchLearner,
      toggleLetter,
      recordStoryRun,
      recordSpeechRun,
      recordResult,
      completeOnboarding,
      resetOnboarding,
      path: user ? getPath(user.email) : null,
      position: user ? pathPosition(user.email) : { week: 1, total: 1 },
      refreshPath,
      pathVersion,
    }),
    [
      user, learner, prediction, stats, register, login, logout, patchLearner,
      toggleLetter, recordStoryRun, recordSpeechRun, recordResult,
      completeOnboarding, resetOnboarding, refreshPath, pathVersion,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
