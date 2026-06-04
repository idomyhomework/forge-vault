import { useState, useEffect, useRef, useCallback } from "react";
import { calcSetCalories, MET } from "../gymCalories";
import type {
  UserProgramConfig,
  UserProgramDay,
  WorkoutSession as WSession,
  CompletedExercise,
  SetRecord,
  GymPreferences,
} from "../gymTypes";
import RestTimer from "./RestTimer";

// ── WorkoutSession component ───────────────────────────────────────────────
export default function WorkoutSession({
  config,
  dayIndex,
  prefs,
  bodyWeightKg,
  onFinish,
  onDiscard,
}: {
  config: UserProgramConfig;
  dayIndex: number;
  prefs: GymPreferences;
  bodyWeightKg: number;
  onFinish: (session: WSession) => void;
  onDiscard: () => void;
}) {
  const day: UserProgramDay = config.days[dayIndex];
  const exercises = day.exercises.filter((e) => e.enabled);

  // ── Session state ────────────────────────────────────────────────────────
  const [exerciseOrder, setExerciseOrder] = useState(() =>
    exercises.map((_, i) => i),
  );
  const [exIdx, setExIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [phase, setPhase] = useState<
    "weight" | "active" | "reps" | "rest" | "done"
  >("weight");
  const [weightInput, setWeightInput] = useState("");
  const [repsInput, setRepsInput] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [completed, setCompleted] = useState<CompletedExercise[]>([]);
  const [sessionStart] = useState(Date.now());
  const [showStopMenu, setShowStopMenu] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const setStartRef = useRef<number>(0);
  const pendingDurationRef = useRef<number>(0);
  const finishedRef = useRef(false);

  const currentExercise = exercises[exerciseOrder[exIdx]];

  // ── Bodyweight exercise detection ────────────────────────────────────────
  const isBW = currentExercise.met === MET.bodyweight;

  // ── Live stopwatch during active set ────────────────────────────────────
  useEffect(() => {
    if (phase !== "active") {
      clearInterval(timerRef.current ?? undefined);
      return;
    }
    timerRef.current = setInterval(
      () => setElapsed(Math.round((Date.now() - setStartRef.current) / 1000)),
      500,
    );
    return () => clearInterval(timerRef.current ?? undefined);
  }, [phase]);

  // ── Build session snapshot ───────────────────────────────────────────────
  const buildSession = useCallback(
    (snap: CompletedExercise[], isPartial: boolean): WSession => {
      const totalDuration = Math.round((Date.now() - sessionStart) / 1000);
      const totalCal = snap.reduce(
        (s, ex) => s + ex.sets.reduce((s2, set) => s2 + set.caloriesBurned, 0),
        0,
      );
      return {
        id: crypto.randomUUID(),
        configId: config.id,
        programId: config.programId,
        date: new Date().toISOString().slice(0, 10),
        dayIndex,
        dayName: day.name,
        exercises: snap,
        totalDurationSecs: totalDuration,
        totalCaloriesBurned: Math.round(totalCal),
        isPartial,
      };
    },
    [config.id, config.programId, dayIndex, day.name, sessionStart],
  );

  // ── Start a set ──────────────────────────────────────────────────────────
  const handleStart = () => {
    setElapsed(0);
    setStartRef.current = Date.now();
    setPhase("active");
  };

  // ── Finish a set (stopwatch → reps input) ────────────────────────────────
  const handleFinish = () => {
    pendingDurationRef.current = Math.max(
      1,
      Math.round((Date.now() - setStartRef.current) / 1000),
    );
    setElapsed(0);
    setRepsInput("");
    setPhase("reps");
  };

  // ── Confirm reps and save the set ────────────────────────────────────────
  const handleRepsConfirm = () => {
    const reps = Math.max(1, parseInt(repsInput) || 1);
    const cal = calcSetCalories(currentExercise.met, bodyWeightKg, reps);
    // For bodyweight exercises: stored weight = body weight + any extra added (e.g. vest).
    // For weighted exercises: stored weight = entered weight.
    const extraKg = Math.max(0, parseFloat(weightInput) || 0);
    const effectiveWeight = isBW
      ? bodyWeightKg + extraKg
      : Math.max(1, extraKg);
    const record: SetRecord = {
      setNumber: setIdx + 1,
      weightKg: effectiveWeight,
      reps,
      durationSecs: pendingDurationRef.current,
      caloriesBurned: cal,
    };

    const isLastSet = setIdx >= currentExercise.sets - 1;
    const isLastExercise = exIdx >= exerciseOrder.length - 1;

    setCompleted((prev) => {
      const exId = currentExercise.id;
      const existing = prev.find((c) => c.exerciseId === exId);
      return existing
        ? prev.map((c) =>
            c.exerciseId === exId ? { ...c, sets: [...c.sets, record] } : c,
          )
        : [
            ...prev,
            {
              exerciseId: exId,
              exerciseName: currentExercise.name,
              muscle: currentExercise.muscle,
              sets: [record],
            },
          ];
    });

    if (isLastSet && isLastExercise) {
      setPhase("done");
      return;
    }

    if (prefs.showRestTimer) {
      setPhase("rest");
    } else if (isLastSet) {
      advanceExercise();
    } else {
      setSetIdx((s) => s + 1);
      setPhase("weight");
    }
  };

  const advanceExercise = () => {
    setExIdx((i) => i + 1);
    setSetIdx(0);
    setWeightInput("");
    setPhase("weight");
  };

  const handleRestDone = () => {
    const isLastSet = setIdx >= currentExercise.sets - 1;
    if (isLastSet) {
      advanceExercise();
    } else {
      setSetIdx((s) => s + 1);
      setPhase("weight");
    }
  };

  // ── Reorder upcoming exercises ───────────────────────────────────────────
  const moveUp = (i: number) => {
    if (i <= exIdx + 1) return;
    setExerciseOrder((prev) => {
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  };
  const moveDown = (i: number) => {
    if (i >= exerciseOrder.length - 1 || i <= exIdx) return;
    setExerciseOrder((prev) => {
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  };

  // ── Urgent finish with save ──────────────────────────────────────────────
  const handleUrgentSave = useCallback(() => {
    setCompleted((snap) => {
      const remaining = exerciseOrder
        .map((i) => exercises[i])
        .filter((ex) => !snap.find((c) => c.exerciseId === ex.id));
      const fullSnap: CompletedExercise[] = [
        ...snap,
        ...remaining.map((ex) => ({
          exerciseId: ex.id,
          exerciseName: ex.name,
          muscle: ex.muscle,
          sets: [] as SetRecord[],
        })),
      ];
      onFinish(buildSession(fullSnap, false));
      return snap;
    });
  }, [exerciseOrder, exercises, onFinish, buildSession]);

  // ── Auto-finish when phase becomes done ──────────────────────────────────
  useEffect(() => {
    if (phase === "done" && !finishedRef.current) {
      finishedRef.current = true;
      // Use setTimeout so state has flushed
      setTimeout(() => {
        setCompleted((snap) => {
          onFinish(buildSession(snap, false));
          return snap;
        });
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const totalKcal = completed.reduce(
    (s, ex) => s + ex.sets.reduce((s2, set) => s2 + set.caloriesBurned, 0),
    0,
  );

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* ── Session header ────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border px-4 py-3 flex items-center justify-between"
        style={{ background: day.color + "12", borderColor: day.color + "33" }}
      >
        <div>
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted">
            {day.label}
          </p>
          <h3
            className="font-display text-lg tracking-wide leading-none"
            style={{ color: day.color }}
          >
            {day.name}
          </h3>
          <p className="font-sans text-[11px] text-muted mt-0.5">
            {exIdx + 1}/{exerciseOrder.length} exercises ·{" "}
            {Math.round(totalKcal)} kcal
          </p>
        </div>
        {showStopMenu ? (
          <div className="flex flex-col gap-1.5 items-end shrink-0">
            <div className="flex gap-1.5">
              <button
                onClick={onDiscard}
                className="px-3 py-1.5 rounded-xl font-mono text-[10px] uppercase tracking-widest text-crimson border border-crimson/40 hover:bg-crimson/10 transition-colors active:scale-95"
              >
                Discard
              </button>
              <button
                onClick={handleUrgentSave}
                className="px-3 py-1.5 rounded-xl font-mono text-[10px] uppercase tracking-widest text-surface transition-colors active:scale-95"
                style={{ background: day.color }}
              >
                Finish
              </button>
            </div>
            <button
              onClick={() => setShowStopMenu(false)}
              className="font-mono text-[9px] text-muted hover:text-fore transition-colors"
            >
              ↩ cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowStopMenu(true)}
            className="shrink-0 px-3 py-1.5 rounded-xl font-mono text-[10px] uppercase tracking-widest text-muted border border-line hover:text-crimson hover:border-crimson/40 transition-colors active:scale-95"
          >
            Stop
          </button>
        )}
      </div>

      {/* ── Active exercise card ──────────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-line overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-0.5">
            Current exercise
          </p>
          <div className="flex items-center gap-2">
            <p className="font-display text-xl tracking-wide text-fore flex-1">
              {currentExercise.name}
            </p>
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(currentExercise.name + " exercise tutorial")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-muted hover:text-red-400 transition-colors"
              title="Watch on YouTube"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" />
              </svg>
            </a>
          </div>
          <p className="font-sans text-[11px] text-muted mt-0.5">
            {currentExercise.muscle} · {currentExercise.sets} sets ×{" "}
            {currentExercise.reps}
          </p>
        </div>

        {/* ── Set progress dots ────────────────────────────────────────── */}
        <div className="flex gap-1.5 px-4 py-2">
          {Array.from({ length: currentExercise.sets }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full transition-all"
              style={{
                background:
                  i < setIdx
                    ? day.color
                    : i === setIdx
                      ? day.color + "66"
                      : "#2a2a35",
              }}
            />
          ))}
        </div>
        <p className="font-mono text-[10px] text-muted px-4 pb-2">
          Set {setIdx + 1} of {currentExercise.sets}
        </p>

        {/* ── Weight input phase ────────────────────────────────────────── */}
        {phase === "weight" && (
          <div className="px-4 pb-4 flex flex-col gap-3">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-1.5">
                {isBW ? "Extra weight added (kg)" : "Working weight (kg)"}
              </label>
              <input
                type="number"
                min="0"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder={
                  isBW ? "0 = bodyweight only" : "blank = saved as 1 kg"
                }
                className="w-full bg-card2 rounded-xl border border-line px-4 py-3 font-sans text-xl text-fore outline-none focus:border-acid/60 transition-colors text-center"
                autoFocus
              />
              {isBW && (
                <p className="font-mono text-[9px] text-muted mt-1.5 text-center">
                  Your body weight ({bodyWeightKg} kg) is included automatically
                </p>
              )}
            </div>
            <button
              onClick={handleStart}
              className="w-full py-3.5 rounded-xl font-display text-xl tracking-widest text-surface transition-all active:scale-95"
              style={{ background: day.color }}
            >
              START
            </button>
          </div>
        )}

        {/* ── Active stopwatch phase ────────────────────────────────────── */}
        {phase === "active" && (
          <div className="px-4 pb-4 flex flex-col items-center gap-3">
            <div className="text-center py-2">
              <p
                className="font-display text-5xl leading-none gym-pulse"
                style={{ color: day.color }}
              >
                {elapsed}s
              </p>
              <p className="font-mono text-[10px] text-muted mt-1 uppercase tracking-widest">
                {isBW
                  ? `in progress · BW ${parseFloat(weightInput) > 0 ? `+ ${weightInput} kg` : `(${bodyWeightKg} kg)`}`
                  : `in progress · ${weightInput || "0"} kg`}
              </p>
            </div>
            <button
              onClick={handleFinish}
              className="w-full py-3.5 rounded-xl font-display text-xl tracking-widest text-fore bg-emerald-500/20 border border-emerald-500/40 transition-all active:scale-95"
            >
              FINISH SET ✓
            </button>
          </div>
        )}

        {/* ── Reps input phase ─────────────────────────────────────────── */}
        {phase === "reps" && (
          <div className="px-4 pb-4 flex flex-col gap-3">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-1.5">
                Reps completed
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={repsInput}
                onChange={(e) => setRepsInput(e.target.value)}
                placeholder="e.g. 10"
                className="w-full bg-card2 rounded-xl border border-line px-4 py-3 font-sans text-xl text-fore outline-none focus:border-acid/60 transition-colors text-center"
                autoFocus
              />
            </div>
            {setIdx >= currentExercise.sets - 1 &&
            exIdx >= exerciseOrder.length - 1 ? (
              <button
                onClick={handleRepsConfirm}
                disabled={!repsInput}
                className="w-full py-3.5 rounded-xl font-display text-xl tracking-widest text-surface transition-all active:scale-95 disabled:opacity-40"
                style={{ background: day.color }}
              >
                FINISH
              </button>
            ) : (
              <button
                onClick={handleRepsConfirm}
                disabled={!repsInput}
                className="w-full py-3.5 rounded-xl font-display text-xl tracking-widest text-fore bg-emerald-500/20 border border-emerald-500/40 transition-all active:scale-95 disabled:opacity-40"
              >
                CONFIRM →
              </button>
            )}
          </div>
        )}

        {/* ── Rest phase ───────────────────────────────────────────────── */}
        {phase === "rest" && (
          <div className="px-4 pb-4">
            <RestTimer
              durationSecs={prefs.restDurationSecs}
              onDone={handleRestDone}
              onSkip={handleRestDone}
            />
          </div>
        )}
      </div>

      {/* ── Exercise queue (reorderable) ──────────────────────────────── */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
          Exercise Queue
        </p>
        <div className="bg-card rounded-2xl border border-line overflow-hidden">
          {exerciseOrder.map((origIdx, i) => {
            const ex = exercises[origIdx];
            const isDone = i < exIdx;
            const isCurrent = i === exIdx;
            const compEx = completed.find((c) => c.exerciseId === ex.id);
            return (
              <div
                key={ex.id}
                className="px-4 py-3 border-b border-line last:border-b-0 flex items-center gap-3"
                style={isCurrent ? { background: day.color + "10" } : undefined}
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold transition-colors"
                  style={{
                    background: isDone
                      ? "#44FF8828"
                      : isCurrent
                        ? day.color
                        : "rgba(255,255,255,0.06)",
                    color: isCurrent ? "#0a0a0c" : undefined,
                  }}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-sans text-xs font-semibold truncate ${isDone ? "text-muted" : "text-fore"}`}
                  >
                    {ex.name}
                  </p>
                  <p className="font-mono text-[9px] text-muted">
                    {compEx
                      ? `${compEx.sets.length}/${ex.sets} sets done`
                      : `${ex.sets}×${ex.reps}`}
                  </p>
                </div>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + " exercise tutorial")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted hover:text-red-400 transition-colors"
                  title="Watch on YouTube"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" />
                  </svg>
                </a>
                {!isDone && !isCurrent && (
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={() => moveUp(i)}
                      className="text-[11px] text-muted hover:text-fore px-1 transition-colors disabled:opacity-20"
                      disabled={i <= exIdx + 1}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveDown(i)}
                      className="text-[11px] text-muted hover:text-fore px-1 transition-colors disabled:opacity-20"
                      disabled={i >= exerciseOrder.length - 1}
                    >
                      ↓
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Exercise tip ─────────────────────────────────────────────── */}
      {currentExercise.notes && (
        <div className="bg-card rounded-2xl border border-line px-4 py-3 flex gap-2.5">
          <span className="text-sm shrink-0">💡</span>
          <p className="font-sans text-[11px] text-muted leading-relaxed">
            {currentExercise.notes}
          </p>
        </div>
      )}
    </div>
  );
}
