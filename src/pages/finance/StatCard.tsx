// ── Stat Card ──────────────────────────────────────────────────────────────
export default function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-3 flex flex-col gap-1 border border-line">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
        {label}
      </span>
      <span className={`text-lg font-black ${color}`}>{value}</span>
    </div>
  );
}
