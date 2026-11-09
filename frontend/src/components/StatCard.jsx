import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const icons = {
  total: "◫",
  completed: "✓",
  pending: "◷",
  progress: "↗",
};

export default function StatCard({ label, value, tone, note, change }) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span className={`stat-icon ${tone}`}>{icons[tone]}</span>
        {change && <span className="stat-change"><ArrowUpRight size={14} /> {change}</span>}
      </div>
      <p className="stat-label">{label}</p>
      <div className="stat-value">{value}</div>
      <p className="stat-note">{note}</p>
      {tone === "completed" && (
        <div className="stat-bottom"><span>Completion rate</span><strong>{change || "0%"}</strong><ArrowDownRight size={14} /></div>
      )}
    </article>
  );
}
