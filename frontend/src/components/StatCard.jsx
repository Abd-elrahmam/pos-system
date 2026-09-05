export default function StatCard({ label, value, sub, tone = "default" }) {
  const toneClasses = {
    default: "text-ink",
    primary: "text-primary-dark",
    accent: "text-accent-dark",
    danger: "text-danger",
  };

  return (
    <div className="bg-surface border border-border rounded p-5">
      <p className="text-sm text-muted mb-2">{label}</p>
      <p className={`text-2xl font-bold ${toneClasses[tone]}`}>{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}
