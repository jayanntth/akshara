import { useI18n } from "../i18n/index.jsx";

/**
 * A single skill readout.
 *
 * The bar shows the estimate; the thin track behind it shows how much evidence
 * the estimate rests on. A confident 40% and a guessed 40% are different
 * things, and hiding that difference would make the dashboard lie politely.
 */
export default function SkillBar({ skill, value, confidence }) {
  const { t } = useI18n();
  const pct = Math.round(value * 100);
  const conf = Math.round((confidence ?? 0) * 100);

  return (
    <div className="skillbar">
      <div className="skillbar-head">
        <span className="skillbar-name">{t(`skill.${skill}`)}</span>
        <span className="skillbar-val">{pct}%</span>
      </div>
      <div className="skillbar-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <span className="skillbar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="skillbar-conf">{t("dash.confidence", { n: conf })}</span>
    </div>
  );
}

/** Small labelled number used across the dashboard and progress pages. */
export function StatCard({ label, value, sub }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
      {sub ? <span className="stat-sub">{sub}</span> : null}
    </div>
  );
}
