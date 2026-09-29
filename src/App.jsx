import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "./context/AppContext.jsx";
import Navbar from "./components/Navbar.jsx";
import TeacherOnboarding from "./components/TeacherOnboarding.jsx";
import Home from "./pages/Home.jsx";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Learn from "./pages/Learn.jsx";
import Assessment from "./pages/Assessment.jsx";
import LearningPath from "./pages/LearningPath.jsx";
import Progress from "./pages/Progress.jsx";
import Achievements from "./pages/Achievements.jsx";
import Profile from "./pages/Profile.jsx";

/**
 * Routing is React state mirrored into the URL hash.
 *
 * Deliberately not react-router: the brief pins the stack to React, Vite and
 * the Web Speech API, this app has nine screens, and a hash route can never
 * 404 on a static host the way a path route can when a refresh misses the
 * rewrite rule. The back button still works because the hash is real history.
 */
const ROUTES = {
  home: Home,
  auth: Auth,
  dashboard: Dashboard,
  learn: Learn,
  assess: Assessment,
  path: LearningPath,
  progress: Progress,
  badges: Achievements,
  profile: Profile,
};

const PROTECTED = new Set(["dashboard", "learn", "assess", "path", "progress", "badges", "profile"]);

function readHash() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const id = raw.split("?")[0] || "home";
  return ROUTES[id] ? id : "home";
}

export default function App() {
  const { user, learner, completeOnboarding } = useApp();
  const [route, setRoute] = useState(readHash);
  const [params, setParams] = useState(null);

  // Writing the hash fires `hashchange`, which would otherwise wipe the params
  // go() just set. This flag marks navigation the app initiated, so only a
  // genuine back/forward or typed URL clears them.
  const selfNavigated = useRef(false);

  const go = useCallback((id, nextParams) => {
    selfNavigated.current = true;
    setRoute(id);
    setParams(nextParams || null);
    window.location.hash = `#/${id}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      if (selfNavigated.current) {
        selfNavigated.current = false;
        setRoute(readHash());
        return;
      }
      setRoute(readHash());
      setParams(null);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // A signed-out visitor never sits on a learner screen, and a signed-in
  // learner never sits on the login form.
  useEffect(() => {
    if (!user && PROTECTED.has(route)) go("home");
    if (user && (route === "auth" || route === "home")) go("dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, route]);

  const Page = ROUTES[route] || Home;
  const needsOnboarding = Boolean(user && learner && !learner.onboarded);

  return (
    <div className="app">
      <Navbar route={route} go={go} />

      <main className="main">
        {user && !learner?.onboarded ? null : <Page go={go} params={params} />}
      </main>

      {/* Change #1: Mira's questions open over the dashboard the moment a
          learner signs in for the first time, and again whenever they ask to
          answer them afresh from the profile page. */}
      <TeacherOnboarding
        open={needsOnboarding}
        initial={learner || undefined}
        onFinish={(answers) => {
          completeOnboarding(answers);
          go("dashboard");
        }}
      />

      <footer className="foot">
        <span>Akshara</span>
        <span className="muted small">React · Vite · Web Speech API</span>
      </footer>
    </div>
  );
}
