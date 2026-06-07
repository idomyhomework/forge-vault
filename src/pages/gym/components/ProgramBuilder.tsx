import { useState } from "react";
import { getProgramById } from "../gymPrograms";
import { isTimedReps } from "../gymCalories";
import { MUSCLE_COLORS } from "../gymData";
import YouTubeIcon from "./YouTubeIcon";
import type { UserProgramConfig, UserProgramDay, UserExercise } from "../gymTypes";

// ── ProgramBuilder component ───────────────────────────────────────────────
export default function ProgramBuilder({
  config,
  onSave,
}: {
  config: UserProgramConfig;
  onSave: (days: UserProgramDay[]) => void;
}) {
  const [days, setDays] = useState<UserProgramDay[]>(config.days);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [dirty, setDirty] = useState(false);

  const template = getProgramById(config.programId);
  const activeDay = days[activeDayIdx];

  // ── Toggle exercise enabled/disabled ────────────────────────────────────
  const toggleExercise = (exId: string) => {
    setDays((prev) =>
      prev.map((d, di) =>
        di !== activeDayIdx
          ? d
          : { ...d, exercises: d.exercises.map((e) => e.id === exId ? { ...e, enabled: !e.enabled } : e) },
      ),
    );
    setDirty(true);
  };

  // ── Adjust set count ─────────────────────────────────────────────────────
  const updateSets = (exId: string, delta: number) => {
    setDays((prev) =>
      prev.map((d, di) =>
        di !== activeDayIdx
          ? d
          : {
              ...d,
              exercises: d.exercises.map((e) =>
                e.id === exId
                  ? { ...e, sets: Math.max(1, Math.min(10, e.sets + delta)) }
                  : e,
              ),
            },
      ),
    );
    setDirty(true);
  };

  // ── Toggle timed (seconds) vs reps tracking ──────────────────────────────
  const toggleTimed = (exId: string) => {
    setDays((prev) =>
      prev.map((d, di) =>
        di !== activeDayIdx
          ? d
          : {
              ...d,
              exercises: d.exercises.map((e) =>
                e.id === exId
                  ? { ...e, isTimed: !(e.isTimed ?? isTimedReps(e.reps)) }
                  : e,
              ),
            },
      ),
    );
    setDirty(true);
  };

  // ── Add an exercise from the template pool ───────────────────────────────
  const addExercise = (ex: UserExercise) => {
    if (activeDay.exercises.some((e) => e.id === ex.id)) return;
    setDays((prev) =>
      prev.map((d, di) =>
        di !== activeDayIdx ? d : { ...d, exercises: [...d.exercises, ex] },
      ),
    );
    setDirty(true);
  };

  // ── Reset to program defaults ────────────────────────────────────────────
  const resetDay = () => {
    const templateDay = template?.days[activeDayIdx];
    if (!templateDay) return;
    setDays((prev) =>
      prev.map((d, di) =>
        di !== activeDayIdx
          ? d
          : {
              ...d,
              exercises: templateDay.exercises.filter((e) => e.rec).map((e) => ({
                id: e.id, name: e.name, muscle: e.muscle,
                sets: e.sets, reps: e.reps, notes: e.notes, met: e.met,
                enabled: true,
                isTimed: e.isTimed ?? isTimedReps(e.reps),
              })),
            },
      ),
    );
    setDirty(true);
  };

  // ── Exercises from template not yet in the day ───────────────────────────
  const templateDay = template?.days[activeDayIdx];
  const addable: UserExercise[] = (templateDay?.exercises ?? [])
    .filter((te) => !activeDay.exercises.some((e) => e.id === te.id))
    .map((te) => ({
      id: te.id, name: te.name, muscle: te.muscle,
      sets: te.sets, reps: te.reps, notes: te.notes, met: te.met,
      enabled: true,
      isTimed: te.isTimed ?? isTimedReps(te.reps),
    }));

  return (
    <div className="flex flex-col gap-4">
      {/* ── Day tabs ──────────────────────────────────────────────────── */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDayIdx(i)}
            className="px-3 py-1.5 rounded-lg font-mono text-[11px] uppercase tracking-wider whitespace-nowrap border transition-all active:scale-95"
            style={{
              background: activeDayIdx === i ? d.color + "20" : undefined,
              borderColor: activeDayIdx === i ? d.color + "88" : "#2a2a35",
              color: activeDayIdx === i ? d.color : "#8b8b9a",
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* ── Day header ────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border px-4 py-3 flex items-center justify-between"
        style={{ background: activeDay.color + "12", borderColor: activeDay.color + "33" }}
      >
        <div>
          <p className="font-display text-lg tracking-wide leading-none" style={{ color: activeDay.color }}>
            {activeDay.name}
          </p>
          <p className="font-sans text-[11px] text-muted mt-0.5">
            {activeDay.exercises.filter((e) => e.enabled).length} active · tap to toggle
          </p>
        </div>
        <button
          onClick={resetDay}
          className="px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider border border-line text-muted hover:text-fore transition-colors active:scale-95"
        >
          ↩ Reset
        </button>
      </div>

      {/* ── Exercise list ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        {activeDay.exercises.map((ex) => {
          const mc = MUSCLE_COLORS[ex.muscle] ?? "#8b8b9a";
          const timed = ex.isTimed ?? isTimedReps(ex.reps);
          return (
            <div
              key={ex.id}
              onClick={() => toggleExercise(ex.id)}
              className="rounded-xl p-3 cursor-pointer border transition-all select-none hover:-translate-y-px active:scale-[0.98]"
              style={{
                background: ex.enabled ? activeDay.color + "12" : "#1c1c24",
                borderColor: ex.enabled ? activeDay.color + "77" : "transparent",
              }}
            >
              <div className="flex items-start gap-2 mb-2">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center shrink-0 text-[10px] font-bold transition-colors"
                  style={{
                    background: ex.enabled ? activeDay.color : "rgba(255,255,255,0.07)",
                    color: ex.enabled ? "#0a0a0c" : undefined,
                  }}
                >
                  {ex.enabled ? "✓" : ""}
                </div>
                <span className={`flex-1 font-sans text-xs font-semibold leading-snug ${ex.enabled ? "text-fore" : "text-muted"}`}>
                  {ex.name}
                </span>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + " exercise tutorial")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted hover:text-red-400 transition-colors"
                  title="Watch on YouTube"
                  onClick={(e) => e.stopPropagation()}
                >
                  <YouTubeIcon />
                </a>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className="px-2 py-0.5 rounded font-mono text-[10px] font-bold"
                  style={{ background: mc + "22", color: mc }}
                >
                  {ex.muscle}
                </span>
                {/* ── Timed (seconds) vs reps toggle ────────────────── */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleTimed(ex.id); }}
                  className="ml-auto px-2 py-0.5 rounded font-mono text-[10px] font-bold transition-colors"
                  style={
                    timed
                      ? { background: activeDay.color + "22", color: activeDay.color }
                      : { background: "rgba(255,255,255,0.06)", color: "#8b8b9a" }
                  }
                  title="Toggle seconds vs reps tracking"
                >
                  {timed ? "⏱ Timed" : "↻ Reps"}
                </button>
                {/* ── Sets stepper ──────────────────────────────────── */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => updateSets(ex.id, -1)}
                    className="w-5 h-5 rounded bg-white/5 text-muted hover:text-fore text-[11px] flex items-center justify-center transition-colors"
                  >
                    −
                  </button>
                  <span className="font-mono text-[10px] text-fore w-14 text-center">
                    {ex.sets}×{ex.reps}
                  </span>
                  <button
                    onClick={() => updateSets(ex.id, 1)}
                    className="w-5 h-5 rounded bg-white/5 text-muted hover:text-fore text-[11px] flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add from program pool ─────────────────────────────────────── */}
      {addable.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
            Add from program
          </p>
          <div className="flex flex-col gap-1.5">
            {addable.map((ex) => {
              const mc = MUSCLE_COLORS[ex.muscle] ?? "#8b8b9a";
              return (
                <button
                  key={ex.id}
                  onClick={() => addExercise(ex)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-card border border-line hover:border-line/60 text-left transition-all active:scale-[0.98]"
                >
                  <span className="text-muted text-sm font-mono">+</span>
                  <span className="flex-1 font-sans text-xs text-muted">{ex.name}</span>
                  <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold" style={{ background: mc + "22", color: mc }}>
                    {ex.muscle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Save ─────────────────────────────────────────────────────── */}
      {dirty && (
        <button
          onClick={() => { onSave(days); setDirty(false); }}
          className="w-full py-3.5 rounded-xl font-display text-lg tracking-widest text-surface bg-acid transition-all active:scale-95"
        >
          Save Changes
        </button>
      )}
    </div>
  );
}
