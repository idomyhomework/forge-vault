import { useState } from "react";
import { motion } from "framer-motion";
import { HABIT_ICON_MAP, HABIT_ICON_KEYS } from "../../utils/icons";
import { COLOR_PRESETS } from "../../utils/habitConstants";
import type { Habit } from "../../types";

// ── Every new habit uses the same cyan accent (COLOR_PRESETS[1] = bg-cyan-400) ──
const HABIT_COLOR = COLOR_PRESETS[1];

// ── Add Habit Modal ────────────────────────────────────────────────────────
export default function AddHabitModal({
  onAdd,
  onClose,
}: {
  onAdd: (h: Omit<Habit, "id" | "checks">) => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("clock");

  const handleSubmit = () => {
    if (!label.trim()) return;
    onAdd({
      label: label.trim(),
      icon,
      color: HABIT_COLOR.color,
      accentHex: HABIT_COLOR.accentHex,
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
            {HABIT_ICON_KEYS.map((key) => {
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
            style={{ backgroundColor: HABIT_COLOR.accentHex }}
          >
            Crear
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
