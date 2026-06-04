import { useState } from "react";
import type { UserProgramConfig, WorkoutSession } from "../gymTypes";
import ProgressCharts from "./ProgressCharts";
import { getProgramById } from "../gymPrograms";

// ── PastPrograms component ─────────────────────────────────────────────────
export default function PastPrograms({
  programs,
  activeId,
  sessions,
  onSwitch,
  onDelete,
}: {
  programs: UserProgramConfig[];
  activeId: string | null;
  sessions: WorkoutSession[];
  onSwitch: (configId: string) => void;
  onDelete: (configId: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // ── Selected day index per program (defaults to 0) ──────────────────────
  const [dayFilters, setDayFilters] = useState<Record<string, number>>({});

  if (programs.length === 0) {
    return (
      <div className="text-center py-16 text-muted">
        <div className="text-4xl mb-3">🗂️</div>
        <p className="font-sans text-sm">No past programs yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
        {programs.length} program{programs.length !== 1 ? "s" : ""} in history
      </p>

      {programs.map((cfg) => {
        const isActive = cfg.id === activeId;
        const programSessions = sessions.filter((s) => s.configId === cfg.id);
        const completedSessions = programSessions.filter((s) => !s.isPartial);
        const totalKcal = Math.round(
          programSessions.reduce((s, se) => s + se.totalCaloriesBurned, 0),
        );
        const template = getProgramById(cfg.programId);
        const color = template?.color ?? "#8b8b9a";
        const isExpanded = expandedId === cfg.id;
        const selectedDay = dayFilters[cfg.id] ?? 0;
        const chartSessions = completedSessions.filter(
          (s) => s.dayIndex === selectedDay,
        );

        return (
          <div
            key={cfg.id}
            className="rounded-2xl border overflow-hidden transition-all"
            style={{
              borderColor: isActive ? color + "66" : "#2a2a35",
              background: isActive ? color + "08" : "#16161c",
            }}
          >
            {/* ── Card header ─────────────────────────────────────────── */}
            <div
              className="px-4 py-3 cursor-pointer select-none"
              onClick={() => setExpandedId(isExpanded ? null : cfg.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: color }}
                  />
                  <div className="min-w-0">
                    <p
                      className="font-display text-base tracking-wide leading-tight truncate"
                      style={{ color: isActive ? color : "#e8e8ee" }}
                    >
                      {cfg.programName}
                    </p>
                    <p className="font-mono text-[9px] text-muted mt-0.5">
                      {cfg.daysPerWeek}d/week · started {cfg.startedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isActive && (
                    <span
                      className="px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider"
                      style={{ background: color + "22", color }}
                    >
                      Active
                    </span>
                  )}
                  <span className="text-muted text-sm">
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* ── Quick stats ────────────────────────────────────────── */}
              <div className="flex gap-4 mt-2">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted">
                    Sessions
                  </p>
                  <p
                    className="font-display text-lg leading-none"
                    style={{ color }}
                  >
                    {completedSessions.length}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted">
                    Kcal
                  </p>
                  <p
                    className="font-display text-lg leading-none"
                    style={{ color }}
                  >
                    {totalKcal}
                  </p>
                </div>
                {cfg.lastTrainedAt && (
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-muted">
                      Last
                    </p>
                    <p className="font-sans text-xs text-fore leading-none mt-0.5">
                      {cfg.lastTrainedAt}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Expanded detail ────────────────────────────────────── */}
            {isExpanded && (
              <div className="border-t border-line px-4 pt-4 pb-4 flex flex-col gap-4">
                {/* Day list */}
                <div className="flex flex-col gap-1.5">
                  {cfg.days.map((d, i) => {
                    const daySess = completedSessions.filter(
                      (s) => s.dayIndex === i,
                    ).length;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: d.color }}
                        />
                        <p className="font-sans text-xs text-muted flex-1 truncate">
                          {d.name}
                        </p>
                        <span className="font-mono text-[9px] text-muted">
                          {daySess}×
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* ── Day filter tabs ────────────────────────────────── */}
                {completedSessions.length > 0 && (
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-1 px-1">
                    {cfg.days.map((d, i) => {
                      const isSelected = selectedDay === i;
                      const shortName = d.name.split("—")[0].trim();
                      return (
                        <button
                          key={i}
                          onClick={() =>
                            setDayFilters((prev) => ({ ...prev, [cfg.id]: i }))
                          }
                          className="shrink-0 px-3 py-1.5 rounded-xl font-mono text-[10px] uppercase tracking-widest transition-all active:scale-95"
                          style={{
                            background: isSelected
                              ? d.color + "20"
                              : "rgba(255,255,255,0.04)",
                            color: isSelected ? d.color : "#8b8b9a",
                            border: `1px solid ${isSelected ? d.color + "44" : "#2a2a35"}`,
                          }}
                        >
                          {shortName}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ── Charts for selected day ──────────────────────────── */}
                {completedSessions.length > 0 && (
                  <ProgressCharts
                    key={selectedDay}
                    sessions={chartSessions}
                    color={cfg.days[selectedDay].color}
                  />
                )}

                {/* Switch button for non-active programs */}
                {!isActive && (
                  <button
                    onClick={() => onSwitch(cfg.id)}
                    className="w-full py-3 rounded-xl font-display text-base tracking-widest transition-all active:scale-95"
                    style={{
                      background: color + "18",
                      color,
                      border: `1px solid ${color}44`,
                    }}
                  >
                    ↩ Switch to This Program
                  </button>
                )}

                {/* ── Delete program ─────────────────────────────────── */}
                {confirmDeleteId === cfg.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="flex-1 py-2.5 rounded-xl font-mono text-[11px] uppercase tracking-widest text-muted border border-line hover:text-fore transition-colors active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onDelete(cfg.id);
                        setConfirmDeleteId(null);
                        setExpandedId(null);
                      }}
                      className="flex-1 py-2.5 rounded-xl font-mono text-[11px] uppercase tracking-widest text-crimson border border-crimson/40 hover:bg-crimson/10 transition-colors active:scale-95"
                    >
                      Confirm Delete
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(cfg.id)}
                    className="w-full py-2.5 rounded-xl font-mono text-[11px] uppercase tracking-widest text-muted border border-line hover:text-crimson hover:border-crimson/40 transition-colors active:scale-95"
                  >
                    Delete Program
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
