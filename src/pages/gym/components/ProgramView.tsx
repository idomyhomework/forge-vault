import type { UserProgramConfig, WorkoutSession } from "../gymTypes";

// ── Week day labels ────────────────────────────────────────────────────────
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ── Helper: ISO date of current week's Monday ──────────────────────────────
function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

// ── ProgramView component ──────────────────────────────────────────────────
export default function ProgramView({
  config,
  sessions,
  incompleteSession,
  onStartWorkout,
  onDismissIncomplete,
}: {
  config: UserProgramConfig;
  sessions: WorkoutSession[];
  incompleteSession: WorkoutSession | null;
  onStartWorkout: (dayIndex: number) => void;
  onDismissIncomplete: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const todayWd = (new Date().getDay() + 6) % 7;
  const isTrainingDay = config.scheduledWeekDays.includes(todayWd);
  const todayDayIndex = config.scheduledWeekDays.indexOf(todayWd);
  const weekStart = getWeekStart();

  const todayCompleted = sessions.find((s) => s.date === today && !s.isPartial);
  const todayPartial = sessions.find((s) => s.date === today && s.isPartial);
  const totalSessions = sessions.filter((s) => !s.isPartial).length;
  const totalKcal = Math.round(
    sessions.reduce((s, se) => s + se.totalCaloriesBurned, 0),
  );

  return (
    <div className="flex flex-col gap-4">
      {/* ── Program header ────────────────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-line px-4 py-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-0.5">
          Active Program
        </p>
        <h2 className="font-display text-2xl tracking-wide text-fore leading-none mb-1">
          {config.programName}
        </h2>
        <p className="font-sans text-[11px] text-muted">
          {config.daysPerWeek} days/week · started {config.startedAt}
        </p>
        <div className="flex gap-4 mt-3">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted">Sessions</p>
            <p className="font-display text-xl text-acid leading-none">{totalSessions}</p>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted">Kcal burned</p>
            <p className="font-display text-xl text-acid leading-none">{totalKcal}</p>
          </div>
          {config.lastTrainedAt && (
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted">Last trained</p>
              <p className="font-sans text-xs text-fore leading-none mt-0.5">{config.lastTrainedAt}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Incomplete session reminder ────────────────────────────────── */}
      {incompleteSession && (
        <div className="bg-orange-acc/10 border border-orange-acc/30 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-lg shrink-0">⚠️</span>
          <div className="flex-1">
            <p className="font-sans text-sm font-semibold text-fore">
              Unfinished workout — {incompleteSession.date}
            </p>
            <p className="font-sans text-[11px] text-muted mt-0.5">
              {incompleteSession.exercises.length} exercises logged. Ready to push more today?
            </p>
          </div>
          <button
            onClick={onDismissIncomplete}
            className="text-muted font-mono text-[11px] hover:text-fore transition-colors shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Week calendar ─────────────────────────────────────────────── */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
          This Week
        </p>
        <div className="grid grid-cols-7 gap-1">
          {WEEK.map((d, i) => {
            const dayPos = config.scheduledWeekDays.indexOf(i);
            const isScheduled = dayPos !== -1;
            const isToday = i === todayWd;
            const programDay = isScheduled ? config.days[dayPos] : null;
            const hasSession = sessions.some(
              (s) => s.dayIndex === dayPos && s.date >= weekStart && !s.isPartial,
            );
            return (
              <div
                key={i}
                className="rounded-xl py-2 px-1 text-center border transition-all"
                style={{
                  background: isScheduled
                    ? (programDay?.color ?? "#fff") + (hasSession ? "30" : "12")
                    : undefined,
                  borderColor: isScheduled
                    ? (programDay?.color ?? "#fff") + "44"
                    : "#2a2a35",
                  outline: isToday ? "1.5px solid #d4ff3f" : undefined,
                }}
              >
                <p
                  className="font-mono text-[10px] leading-none"
                  style={{ color: isScheduled ? programDay?.color : "#2a2a35" }}
                >
                  {d[0]}
                </p>
                <p className="font-mono text-[8px] mt-1 text-muted">
                  {hasSession ? "✓" : isScheduled ? `D${dayPos + 1}` : "—"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Today's workout CTA ───────────────────────────────────────── */}
      {isTrainingDay && todayDayIndex !== -1 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
            Today
          </p>
          {todayCompleted ? (
            <div className="bg-card rounded-2xl border border-emerald-500/30 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-emerald-400 text-sm">✓</span>
                <p className="font-display text-base tracking-wide text-fore">
                  {config.days[todayDayIndex].name}
                </p>
              </div>
              <p className="font-sans text-[11px] text-muted">
                Completed · {todayCompleted.totalCaloriesBurned} kcal ·{" "}
                {Math.round(todayCompleted.totalDurationSecs / 60)} min
              </p>
            </div>
          ) : (
            <div
              className="rounded-2xl border px-4 py-4"
              style={{
                background: config.days[todayDayIndex].color + "12",
                borderColor: config.days[todayDayIndex].color + "33",
              }}
            >
              <p
                className="font-display text-xl tracking-wide leading-none mb-1"
                style={{ color: config.days[todayDayIndex].color }}
              >
                {config.days[todayDayIndex].name}
              </p>
              <p className="font-sans text-[11px] text-muted mb-3">
                {config.days[todayDayIndex].focus} ·{" "}
                {config.days[todayDayIndex].exercises.filter((e) => e.enabled).length} exercises
              </p>
              {todayPartial && (
                <p className="font-sans text-[11px] text-orange-400 mb-2">
                  ⚡ Already started today — {todayPartial.exercises.length} exercises logged
                </p>
              )}
              <button
                onClick={() => onStartWorkout(todayDayIndex)}
                className="w-full py-3 rounded-xl font-display text-lg tracking-widest text-surface transition-all active:scale-95"
                style={{ background: config.days[todayDayIndex].color }}
              >
                Start Workout →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── All days ──────────────────────────────────────────────────── */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
          All Days
        </p>
        <div className="bg-card rounded-2xl border border-line overflow-hidden">
          {config.days.map((d, i) => {
            const sessCount = sessions.filter((s) => s.dayIndex === i && !s.isPartial).length;
            return (
              <div
                key={i}
                className="px-4 py-3 border-b border-line last:border-b-0 flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-semibold text-fore truncate">{d.name}</p>
                  <p className="font-mono text-[9px] text-muted">{d.focus}</p>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                  <button
                    onClick={() => onStartWorkout(i)}
                    className="px-3 py-1 rounded-lg font-mono text-[10px] uppercase tracking-wider border border-line text-muted hover:text-fore transition-colors active:scale-95"
                  >
                    Train
                  </button>
                  {sessCount > 0 && (
                    <p className="font-mono text-[8px] text-muted">{sessCount}× done</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
