import { useState, useMemo } from "react";
import "./App.css";

interface Habit {
  id: string;
  label: string;
  icon: string;
  color: string;
  accentHex: string;
  checks: boolean[];
}

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];

const INITIAL_HABITS: Habit[] = [
  {
    id: "wake",
    label: "Despertar a las 05:00",
    icon: "⏰",
    color: "bg-sky-400",
    accentHex: "#38bdf8",
    checks: [false, false, false, false, false, false, false],
  },
  {
    id: "gym",
    label: "Gimnasio",
    icon: "💪",
    color: "bg-cyan-400",
    accentHex: "#22d3ee",
    checks: [false, false, false, false, false, false, false],
  },
  {
    id: "reading",
    label: "Lectura / Aprendizaje",
    icon: "📚",
    color: "bg-emerald-400",
    accentHex: "#34d399",
    checks: [false, false, false, false, false, false, false],
  },
  {
    id: "planning",
    label: "Planificación del día",
    icon: "🗓️",
    color: "bg-pink-400",
    accentHex: "#f472b6",
    checks: [false, false, false, false, false, false, false],
  },
];

const XP_PER_CHECK = 25;

// ── Sparkline chart ────────────────────────────────────────────────────────
function ConsistencyChart({
  habits,
  accentHex,
}: {
  habits: Habit[];
  accentHex: string;
}) {
  const W = 320;
  const H = 72;
  const PAD = 16;

  const ratios = DAYS.map((_, d) => {
    const done = habits.filter((h) => h.checks[d]).length;
    return habits.length ? done / habits.length : 0;
  });

  const pts = ratios.map((r, i) => {
    const x = PAD + (i / (DAYS.length - 1)) * (W - PAD * 2);
    const y = H - PAD - r * (H - PAD * 2);
    return { x, y };
  });

  const pathD = pts
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

  const ease = "0.5s cubic-bezier(0.4, 0, 0.2, 1)";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 72 }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accentHex} stopOpacity="0.25" />
          <stop offset="100%" stopColor={accentHex} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path
        d={areaD}
        fill="url(#areaGrad)"
        style={{ transition: `d ${ease}` }}
      />

      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={accentHex}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: `d ${ease}` }}
      />

      {/* Dots */}
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill="#1a1a2e"
          stroke={accentHex}
          strokeWidth="2"
          style={{ transition: `cy ${ease}` }}
        />
      ))}

      {/* Day labels */}
      {pts.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={H - 1}
          textAnchor="middle"
          fontSize="9"
          fill="#64748b"
          fontFamily="inherit"
        >
          {DAYS[i]}
        </text>
      ))}
    </svg>
  );
}

// ── Check button ───────────────────────────────────────────────────────────
function CheckBox({
  checked,
  color,
  onToggle,
}: {
  checked: boolean;
  color: string;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`
        w-9 h-9 rounded-xl flex items-center justify-center
        transition-all duration-300 ease-in-out active:scale-90
        ${checked ? `${color} shadow-lg` : "bg-white/5 hover:bg-white/10"}
      `}
    >
      {/* Siempre renderizado, animado con opacity */}
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4 text-white transition-opacity duration-300"
        style={{ opacity: checked ? 1 : 0 }}
      >
        <polyline points="2,8 6,12 14,4" />
      </svg>
    </button>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);

  const toggle = (habitId: string, day: number) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? { ...h, checks: h.checks.map((c, i) => (i === day ? !c : c)) }
          : h,
      ),
    );
  };

  const totalXP = useMemo(
    () =>
      habits.reduce(
        (sum, h) => sum + h.checks.filter(Boolean).length * XP_PER_CHECK,
        0,
      ),
    [habits],
  );

  const chartColor = "#ef4444";

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm md:max-w-2xl bg-[#16162a] rounded-3xl p-5 shadow-2xl border border-white/5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-200">
            Consistencia semanal
          </span>
          <span className="text-sm font-bold text-yellow-400 flex items-center gap-1">
            ✨ {totalXP} XP
          </span>
        </div>

        {/* Chart */}
        <div className="mb-4">
          <ConsistencyChart habits={habits} accentHex={chartColor} />
        </div>

        {/* Column headers */}
        <div className="flex items-center mb-2 px-1">
          <span className="flex-1 text-xs text-slate-500">Hábito</span>
          <div className="flex gap-1">
            {DAYS.map((d) => (
              <span
                key={d}
                className="w-9 text-center text-xs font-semibold text-slate-500"
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 mb-3" />

        {/* Habits list */}
        <div className="flex flex-col gap-2">
          {habits.map((habit) => (
            <div key={habit.id} className="flex items-center gap-2 py-0.5">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-base md:text-lg">{habit.icon}</span>
                <span className="text-xs md:text-sm font-medium text-slate-300">
                  {habit.label}
                </span>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {habit.checks.map((checked, day) => (
                  <CheckBox
                    key={day}
                    checked={checked}
                    color={habit.color}
                    onToggle={() => toggle(habit.id, day)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
          <span className="text-xs text-slate-500">Esta semana</span>
          <span className="text-xs text-slate-400">
            {habits.reduce((s, h) => s + h.checks.filter(Boolean).length, 0)} /{" "}
            {habits.length * 7} completados
          </span>
        </div>
      </div>
    </div>
  );
}
