import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/storageKeys";
import { HABIT_ICON_MAP, HABIT_ICON_KEYS } from "../utils/icons";
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
    icon: "clock",
    color: "bg-sky-400",
    accentHex: "#38bdf8",
    checks: [false, false, false, false, false, false, false],
  },
  {
    id: "gym",
    label: "Gimnasio",
    icon: "dumbbell",
    color: "bg-cyan-400",
    accentHex: "#22d3ee",
    checks: [false, false, false, false, false, false, false],
  },
  {
    id: "reading",
    label: "Lectura / Aprendizaje",
    icon: "bookOpen",
    color: "bg-emerald-400",
    accentHex: "#34d399",
    checks: [false, false, false, false, false, false, false],
  },
  {
    id: "planning",
    label: "Planificación del día",
    icon: "calendar",
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
          fill="#0a0a0c"
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
          fill="#8b8b9a"
          fontFamily="Space Mono, monospace"
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
        checked
          ? `${color} shadow-lg`
          : "bg-card2 hover:bg-line border border-line"
      }`}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-surface transition-opacity duration-300"
        style={{ opacity: checked ? 1 : 0 }}
      >
        <polyline points="2,8 6,12 14,4" />
      </svg>
    </button>
  );
}

// ── Icon options ─────────────────────────────────────────────────────────────
const ICON_OPTIONS = HABIT_ICON_KEYS;

// ── Add Habit Modal ────────────────────────────────────────────────────────
function AddHabitModal({
  onAdd,
  onClose,
}: {
  onAdd: (h: Omit<Habit, "id" | "checks">) => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("clock");
  const [colorIdx] = useState(0);

  const handleSubmit = () => {
    if (!label.trim()) return;
    onAdd({
      label: label.trim(),
      icon,
      color: COLOR_PRESETS[colorIdx].color,
      accentHex: COLOR_PRESETS[colorIdx].accentHex,
    });
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-full sm:max-w-sm md:max-w-md bg-card rounded-t-3xl sm:rounded-2xl p-5 border border-line flex flex-col gap-4"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-display text-sm uppercase tracking-wide text-fore">
            Nuevo hábito
          </span>
          <button
            onClick={onClose}
            className="text-muted hover:text-fore text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>
        {/* Label */}
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Nombre del hábito"
          className="w-full bg-card2 border border-line rounded-xl px-3 py-2 text-sm text-fore placeholder-muted focus:outline-none focus:border-acid transition-colors"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        {/* Icon picker */}
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2 block">
            Icono
          </span>
          <div className="grid grid-cols-8 gap-1">
            {ICON_OPTIONS.map((key) => {
              const Icon = HABIT_ICON_MAP[key];
              return (
                <button
                  key={key}
                  onClick={() => setIcon(key)}
                  className={`flex items-center justify-center rounded-lg p-2 transition-all ${
                    icon === key
                      ? "bg-acid/15 ring-1 ring-acid text-acid"
                      : "hover:bg-card2 text-muted hover:text-fore"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider text-muted bg-card2 border border-line hover:border-acid transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!label.trim()}
            className="flex-1 py-2.5 rounded-xl font-display text-sm uppercase tracking-wide text-surface transition-opacity disabled:opacity-40"
            style={{ backgroundColor: COLOR_PRESETS[colorIdx].accentHex }}
          >
            Crear
          </button>
        </div>
      </motion.div>
    </motion.div>
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
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-full sm:max-w-sm bg-card rounded-t-3xl sm:rounded-2xl p-5 border border-line flex flex-col gap-4 max-h-[85vh]"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <span className="font-display text-sm uppercase tracking-wide text-fore">
            Historial semanal
          </span>
          <button
            onClick={onClose}
            className="text-muted hover:text-fore text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {history.length === 0 ? (
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted text-center py-10">
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
                  className="bg-card2 rounded-2xl p-3.5 border border-line flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-fore">
                      Semana del {dateLabel}
                    </span>
                    <span className="font-mono text-xs font-bold text-acid">
                      ✦ {xp} XP
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {week.habits.map((h) => {
                      const done = h.checks.filter(Boolean).length;
                      return (
                        <div
                          key={h.id}
                          className="flex items-center gap-1 bg-card border border-line rounded-lg px-2 py-1"
                        >
                          {(() => { const Icon = HABIT_ICON_MAP[h.icon]; return Icon ? <Icon className="w-3.5 h-3.5" /> : null; })()}
                          <span
                            className="font-mono text-[10px]"
                            style={{ color: h.accentHex }}
                          >
                            {done}/7
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-acid rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-muted">
                      {totalChecked}/{possible} completados · {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
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

  const chartColor = "#d4ff3f";
  const totalChecked = habits.reduce(
    (s, h) => s + h.checks.filter(Boolean).length,
    0,
  );

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Consistencia semanal
        </span>
        <span className="font-mono text-xs text-acid font-bold flex items-center gap-1">
          ✦ {totalXP} XP
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setEditMode(false);
            setShowAddHabit(true);
          }}
          className="flex items-center gap-1 bg-card2 border border-line hover:border-acid rounded-xl px-3 py-1.5 font-mono text-xs text-fore transition-colors"
        >
          + Hábito
        </button>
        <button
          onClick={() => setEditMode((v) => !v)}
          className={`flex items-center gap-1 rounded-xl px-3 py-1.5 font-mono text-xs transition-colors border ${
            editMode
              ? "border-crimson/40 bg-crimson/10 text-crimson"
              : "border-line bg-card2 hover:border-acid text-fore"
          }`}
        >
          {editMode ? "Listo" : "Editar"}
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setShowHistory(true)}
          className="flex items-center gap-1.5 bg-card2 border border-line hover:border-acid rounded-xl px-3 py-1.5 font-mono text-xs text-fore transition-colors"
        >
          <ClipboardList className="w-3.5 h-3.5" /> Historial
        </button>
      </div>

      {/* Chart */}
      <div className="bg-card rounded-2xl p-3 border border-line">
        <ConsistencyChart habits={habits} accentHex={chartColor} />
      </div>

      {/* Column headers */}
      <div className="flex items-center px-1">
        <span className="flex-1 font-mono text-[10px] uppercase tracking-widest text-muted">
          Hábito
        </span>
        <div className="flex gap-1">
          {DAYS.map((d) => (
            <span
              key={d}
              className="w-7 sm:w-9 text-center font-mono text-[10px] uppercase text-muted"
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="h-px bg-line" />

      {/* Habits list */}
      <div className="flex flex-col gap-2">
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center gap-2 py-0.5">
            {editMode && (
              <button
                onClick={() => deleteHabit(habit.id)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-crimson/20 text-crimson hover:bg-crimson/30 flex-shrink-0 text-base leading-none transition-colors"
              >
                −
              </button>
            )}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {(() => { const Icon = HABIT_ICON_MAP[habit.icon]; return Icon ? <Icon className="w-4 h-4 flex-shrink-0 text-fore" /> : null; })()}
              <span className="text-sm font-medium text-fore truncate">
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
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted text-center py-6">
            Sin hábitos. ¡Crea el primero!
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-2 pt-3 border-t border-line flex justify-between items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Esta semana
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted">
            {totalChecked} / {habits.length * 7} completados
          </span>
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted">¿Seguro?</span>
              <button
                onClick={resetWeek}
                className="font-mono text-xs font-bold text-crimson hover:text-crimson/80 transition-colors"
              >
                Sí
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="font-mono text-xs text-muted hover:text-fore transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-fore transition-colors"
            >
              Reiniciar semana
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddHabit && (
          <AddHabitModal
            onAdd={addHabit}
            onClose={() => setShowAddHabit(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showHistory && (
          <HistoryModal history={history} onClose={() => setShowHistory(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
