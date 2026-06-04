import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/storageKeys";
import { uid } from "../utils/uid";
import { DAYS, XP_PER_CHECK, INITIAL_HABITS } from "../utils/habitConstants";
import type { Habit, WeekRecord } from "../types";
import ConsistencyChart from "./habits/ConsistencyChart";
import CheckBox from "./habits/CheckBox";
import HabitIcon from "./habits/HabitIcon";
import AddHabitModal from "./habits/AddHabitModal";
import HistoryModal from "./habits/HistoryModal";

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

  // ── Handlers ───────────────────────────────────────────────────────────
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

  // ── Derived values ─────────────────────────────────────────────────────
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
              <HabitIcon icon={habit.icon} className="w-4 h-4 flex-shrink-0 text-fore" />
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
