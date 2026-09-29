import { useMemo } from "react";
import { useI18n } from "../i18n/index.jsx";
import { useApp } from "../context/AppContext.jsx";
import { evaluateBadges } from "../engine/gamification.js";

const ICONS = {
  book: "📖",
  books: "📚",
  letter: "🔤",
  crown: "👑",
  check: "✅",
  star: "⭐",
  flame: "🔥",
  mic: "🎤",
};

export default function Achievements() {
  const { t } = useI18n();
  const { learner, stats } = useApp();
  const badges = useMemo(() => evaluateBadges(learner), [learner]);
  const unlocked = badges.filter((b) => b.unlocked).length;

  return (
    <div className="page badges">
      <header className="page-head">
        <h1>{t("ach.title")}</h1>
        <p className="muted">{t("ach.sub", { a: unlocked, b: badges.length })}</p>
      </header>

      <div className="badge-grid">
        {badges.map((b) => (
          <div className={`badge${b.unlocked ? " on" : ""}`} key={b.id}>
            <span className="badge-icon" aria-hidden="true">
              {ICONS[b.icon] || "•"}
            </span>
            <strong>{t(b.nameKey)}</strong>
            <span className="muted small">{b.unlocked ? t("c.done") : t(b.hintKey)}</span>
          </div>
        ))}
      </div>

      <p className="muted small center">
        {t("dash.xpLbl")}: {stats.xp} {t("c.xp")} &middot; {t("dash.streak")}: {stats.streak}
      </p>
    </div>
  );
}
