import { motion } from "framer-motion";
import { HABIT_ICON_MAP } from "../../utils/icons";
import { XP_PER_CHECK } from "../../utils/habitConstants";
import type { WeekRecord } from "../../types";

// ── Week History Modal ─────────────────────────────────────────────────────
export default function HistoryModal({
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
                          {(() => {
                            const Icon = HABIT_ICON_MAP[h.icon];
                            return Icon ? <Icon className="w-3.5 h-3.5" /> : null;
                          })()}
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
