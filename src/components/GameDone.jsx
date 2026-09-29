import { useI18n } from "../i18n/index.jsx";
import Teacher from "./Teacher.jsx";

/** The same end card the quiz and puzzles use, so every game finishes alike. */
export default function GameDone({ result, onExit, children }) {
  const { t } = useI18n();
  return (
    <div className="card story-done">
      <Teacher mood={result.score >= 70 ? "cheer" : "smile"} size={96} />
      <h2>{t("as.result", { n: result.score })}</h2>
      <p className="score-line">
        {result.correct} {t("c.of")} {result.total}
      </p>
      {children}
      <button type="button" className="btn btn-primary btn-wide" onClick={onExit}>
        {t("as.backHub")}
      </button>
    </div>
  );
}
