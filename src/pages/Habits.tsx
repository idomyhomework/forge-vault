import { useState, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/storageKeys";
import type { Habit, WeekRecord } from "../types";

// ── Constants ────────────────────────────────────────────────────────────────
const DAYS = ["L", "M", "X", "J", "V", "S", "D"];
const XP_PER_CHECK = 25;

// ── Color presets ────────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { color: "bg-sky-400", accentHex: "#38bdf8" },
  { color: "bg-cyan-400", accentHex: "#22d3ee" },
  { color: "bg-emerald-400", accentHex: "#34d399" },
  { color: "bg-pink-400", accentHex: "#f472b6" },
  { color: "bg-violet-400", accentHex: "#a78bfa" },
  { color: "bg-orange-400", accentHex: "#fb923c" },
  { color: "bg-yellow-400", accentHex: "#facc15" },
  { color: "bg-rose-400", accentHex: "#fb7185" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ── Initial habits ───────────────────────────────────────────────────────────
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
        <linearGradient id="areaGradH" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accentHex} stopOpacity="0.25" />
          <stop offset="100%" stopColor={accentHex} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={areaD}
        fill="url(#areaGradH)"
        style={{ transition: `d ${ease}` }}
      />
      <path
        d={pathD}
        fill="none"
        stroke={accentHex}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: `d ${ease}` }}
      />
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
      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 ease-in-out active:scale-90 ${
        checked ? `${color} shadow-lg` : "bg-white/5 hover:bg-white/10"
      }`}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white transition-opacity duration-300"
        style={{ opacity: checked ? 1 : 0 }}
      >
        <polyline points="2,8 6,12 14,4" />
      </svg>
    </button>
  );
}

// ── Add Habit Modal ────────────────────────────────────────────────────────
function AddHabitModal({
  onAdd,
  onClose,
}: {
  onAdd: (h: Omit<Habit, "id" | "checks">) => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("");
  const [colorIdx, setColorIdx] = useState(0);

  const handleSubmit = () => {
    if (!label.trim()) return;
    onAdd({
      label: label.trim(),
      icon: icon.trim() || "✨",
      color: COLOR_PRESETS[colorIdx].color,
      accentHex: COLOR_PRESETS[colorIdx].accentHex,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-sm md:max-w-md bg-[#16162a] rounded-t-3xl sm:rounded-2xl p-5 border border-white/10 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white">Nuevo hábito</span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Icon + Label */}
        <div className="flex gap-2">
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="✨"
            maxLength={2}
            className="w-12 text-center bg-white/5 border border-white/10 rounded-xl text-lg py-2 text-white placeholder-slate-600 focus:outline-none focus:border-white/30"
          />
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Nombre del hábito"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/30"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        {/* Color picker */}
        <div>
          <span className="text-xs text-slate-500 mb-2 block">Color</span>
          <div className="grid grid-cols-8 gap-2">
            {COLOR_PRESETS.map((opt, i) => (
              <button
                key={opt.accentHex}
                onClick={() => setColorIdx(i)}
                className={`w-8 h-8 rounded-full ${opt.color} transition-transform active:scale-90 ${
                  colorIdx === i
                    ? "ring-2 ring-white ring-offset-2 ring-offset-[#16162a] scale-110"
                    : ""
                }`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 bg-white/5 hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!label.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: COLOR_PRESETS[colorIdx].accentHex }}
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Week History Modal ─────────────────────────────────────────────────────
function HistoryModal({
  history,
  onClose,
}: {
  history: WeekRecord[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-sm bg-[#16162a] rounded-t-3xl sm:rounded-2xl p-5 border border-white/10 flex flex-col gap-4 max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <span className="text-sm font-bold text-white">
            Historial semanal
          </span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-slate-600 text-xs text-center py-10">
            Sin semanas guardadas aún
          </p>
        ) : (
          <div className="overflow-y-auto flex flex-col gap-3 pb-1">
            {[...history].reverse().map((week, idx) => {
              const date = new Date(week.weekStart);
              const dateLabel = date.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
              const totalChecked = week.habits.reduce(
                (s, h) => s + h.checks.filter(Boolean).length,
                0,
              );
              const possible = week.habits.length * 7;
              const pct =
                possible > 0 ? Math.round((totalChecked / possible) * 100) : 0;
              const xp = totalChecked * XP_PER_CHECK;

              return (
                <div
                  key={idx}
                  className="bg-white/5 rounded-2xl p-3.5 border border-white/5 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">
                      Semana del {dateLabel}
                    </span>
                    <span className="text-xs font-bold text-yellow-400">
                      ✨ {xp} XP
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {week.habits.map((h) => {
                      const done = h.checks.filter(Boolean).length;
                      return (
                        <div
                          key={h.id}
                          className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1"
                        >
                          <span className="text-xs">{h.icon}</span>
                          <span
                            className="text-[10px] font-semibold"
                            style={{ color: h.accentHex }}
                          >
                            {done}/7
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {totalChecked}/{possible} completados · {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Habits Page ────────────────────────────────────────────────────────────
export default function Habits() {
  const [habits, setHabits] = useLocalStorage<Habit[]>(
    STORAGE_KEYS.habits,
    INITIAL_HABITS,
  );
  const [history, setHistory] = useLocalStorage<WeekRecord[]>(
    STORAGE_KEYS.habitsHistory,
    [],
  );

  const [editMode, setEditMode] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const toggle = (habitId: string, day: number) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? { ...h, checks: h.checks.map((c, i) => (i === day ? !c : c)) }
          : h,
      ),
    );
  };

  const addHabit = (partial: Omit<Habit, "id" | "checks">) => {
    setHabits((prev) => [
      ...prev,
      { ...partial, id: uid(), checks: Array(7).fill(false) },
    ]);
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const resetWeek = () => {
    if (habits.length === 0) {
      setConfirmReset(false);
      return;
    }
    const now = new Date();
    const day = now.getDay();
    now.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    now.setHours(0, 0, 0, 0);
    const weekStart = now.toISOString();

    setHistory((prev) => [
      { weekStart, habits: JSON.parse(JSON.stringify(habits)) },
      ...prev,
    ]);
    setHabits((prev) =>
      prev.map((h) => ({ ...h, checks: Array(7).fill(false) })),
    );
    setConfirmReset(false);
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
  const totalChecked = habits.reduce(
    (s, h) => s + h.checks.filter(Boolean).length,
    0,
  );

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-200">
          Consistencia semanal
        </span>
        <span className="text-sm font-bold text-yellow-400 flex items-center gap-1">
          ✨ {totalXP} XP
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setEditMode(false);
            setShowAddHabit(true);
          }}
          className="flex items-center gap-1 bg-white/5 hover:bg-white/10 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors"
        >
          + Hábito
        </button>
        <button
          onClick={() => setEditMode((v) => !v)}
          className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
            editMode
              ? "bg-red-500/20 text-red-400"
              : "bg-white/5 hover:bg-white/10 text-slate-300"
          }`}
        >
          {editMode ? "Listo" : "Editar"}
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setShowHistory(true)}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors"
        >
          📋 Historial
        </button>
      </div>

      {/* Chart */}
      <div className="bg-[#1c1c2e] rounded-2xl p-3 border border-white/5">
        <ConsistencyChart habits={habits} accentHex={chartColor} />
      </div>

      {/* Column headers */}
      <div className="flex items-center px-1">
        <span className="flex-1 text-xs text-slate-500">Hábito</span>
        <div className="flex gap-1">
          {DAYS.map((d) => (
            <span
              key={d}
              className="w-7 sm:w-9 text-center text-xs font-semibold text-slate-500"
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/5" />

      {/* Habits list */}
      <div className="flex flex-col gap-2">
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center gap-2 py-0.5">
            {editMode && (
              <button
                onClick={() => deleteHabit(habit.id)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 flex-shrink-0 text-base leading-none transition-colors"
              >
                −
              </button>
            )}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-base flex-shrink-0">{habit.icon}</span>
              <span className="text-sm font-medium text-white truncate">
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

        {habits.length === 0 && (
          <p className="text-xs text-slate-600 text-center py-6">
            Sin hábitos. ¡Crea el primero!
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-2 pt-3 border-t border-white/5 flex justify-between items-center gap-3">
        <span className="text-xs text-slate-500">Esta semana</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            {totalChecked} / {habits.length * 7} completados
          </span>
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">¿Seguro?</span>
              <button
                onClick={resetWeek}
                className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
              >
                Sí
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
            >
              Reiniciar semana
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddHabit && (
        <AddHabitModal
          onAdd={addHabit}
          onClose={() => setShowAddHabit(false)}
        />
      )}
      {showHistory && (
        <HistoryModal history={history} onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}
