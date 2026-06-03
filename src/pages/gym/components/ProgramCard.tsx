import type { TrainingProgram } from "../gymTypes";

// ── Level badge colors ─────────────────────────────────────────────────────
const LEVEL_COLOR: Record<string, string> = {
  beginner:     "#A8FF78",
  intermediate: "#F7971E",
  advanced:     "#FF6B6B",
};

const GOAL_LABEL: Record<string, string> = {
  strength:  "Strength",
  aesthetic: "Aesthetic",
  toning:    "Toning",
  fat_loss:  "Fat Loss",
  beginner:  "Beginner",
};

// ── ProgramCard component ──────────────────────────────────────────────────
export default function ProgramCard({
  program,
  selected,
  onSelect,
}: {
  program: TrainingProgram;
  selected: boolean;
  onSelect: () => void;
}) {
  const lc = LEVEL_COLOR[program.level] ?? "#8b8b9a";
  const days = program.daysOptions[0];

  return (
    <div
      onClick={onSelect}
      className="rounded-2xl border p-4 cursor-pointer select-none transition-all active:scale-[0.98] hover:-translate-y-px"
      style={{
        background: selected ? program.color + "14" : "#16161c",
        borderColor: selected ? program.color + "88" : "#2a2a35",
      }}
    >
      {/* ── Color bar + name ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div
          className="w-2 h-2 rounded-full shrink-0 mt-1.5"
          style={{ background: program.color }}
        />
        <div className="flex-1 min-w-0">
          <p
            className="font-display text-base tracking-wide leading-tight"
            style={{ color: selected ? program.color : "#e8e8ee" }}
          >
            {program.name}
          </p>
          <p className="font-sans text-[11px] text-muted mt-0.5 leading-snug">
            {program.tagline}
          </p>
        </div>
        {selected && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{ background: program.color, color: "#0a0a0c" }}
          >
            ✓
          </div>
        )}
      </div>

      {/* ── Tags ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        <span
          className="px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider"
          style={{ background: lc + "22", color: lc }}
        >
          {program.level}
        </span>
        <span
          className="px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider"
          style={{ background: program.color + "20", color: program.color }}
        >
          {GOAL_LABEL[program.goal]}
        </span>
        <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider bg-white/5 text-muted">
          {days}d/week
        </span>
      </div>
    </div>
  );
}
