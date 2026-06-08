import { useState, useEffect, useRef, useCallback } from "react";
import {
  calcSetCalories,
  calcTimedCalories,
  isTimedReps,
  MET,
} from "../gymCalories";
import YouTubeIcon from "./YouTubeIcon";
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
  onWorkoutStart,
}: {
  config: UserProgramConfig;
  dayIndex: number;
  prefs: GymPreferences;
  bodyWeightKg: number;
  onFinish: (session: WSession) => void;
  onDiscard: () => void;
  onWorkoutStart: () => void;
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
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  // ── Per-workout rest setup (chosen before the workout starts) ─────────────
  // Defaults to the saved global preference; changes here are session-only.
  const [restConfigured, setRestConfigured] = useState(false);
  const [sessionRestSecs, setSessionRestSecs] = useState(
    prefs.restDurationSecs,
  );
  const [restOff, setRestOff] = useState(!prefs.showRestTimer);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const setStartRef = useRef<number>(0);
  const pendingDurationRef = useRef<number>(0);
  const finishedRef = useRef(false);

  // ── Mirror completed → ref ───────────────────────────────────────────────
  // Lets the finish paths read the latest snapshot WITHOUT calling onFinish
  // from inside a setCompleted updater. Updater functions must stay pure —
  // StrictMode (dev) and concurrent rendering can invoke them twice, which
  // would fire onFinish twice and log a duplicate session.
  const completedRef = useRef<CompletedExercise[]>([]);
  useEffect(() => {
    completedRef.current = completed;
  }, [completed]);

  const currentExercise = exercises[exerciseOrder[exIdx]];

  // ── Timed (isometric) exercise detection ─────────────────────────────────
  // Plank, L-sit, hollow-body hold… are measured in seconds, not reps.
  // Falls back to the reps-string heuristic for programs saved before isTimed.
  const isTimed = currentExercise.isTimed ?? isTimedReps(currentExercise.reps);

  // ── Bodyweight exercise detection ────────────────────────────────────────
  // Timed holds are bodyweight-loaded too, so the weight step records
  // body weight + any extra (e.g. a plate on a weighted plank).
  const isBW = currentExercise.met === MET.bodyweight || isTimed;

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

  // ── Effective stored weight for the current exercise ─────────────────────
  // Bodyweight / timed holds: body weight + any extra (vest, plate).
  // Weighted exercises: the entered working weight (min 1 kg).
  const effectiveWeight = (): number => {
    const extraKg = Math.max(0, parseFloat(weightInput) || 0);
    return isBW ? bodyWeightKg + extraKg : Math.max(1, extraKg);
  };

  // ── Append a set record and advance the session ──────────────────────────
  // Shared by the reps-based and timed finish paths so the advance/rest/done
  // branching lives in one place.
  const commitAndAdvance = (record: SetRecord) => {
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
              isTimed,
            },
          ];
    });

    if (isLastSet && isLastExercise) {
      setPhase("done");
      return;
    }

    if (!restOff) {
      setPhase("rest");
    } else if (isLastSet) {
      advanceExercise();
    } else {
      setSetIdx((s) => s + 1);
      setPhase("weight");
    }
  };

  // ── Finish a set ─────────────────────────────────────────────────────────
  // Timed holds save the elapsed seconds directly (no reps prompt); reps-based
  // exercises stash the duration and move on to the reps-input phase.
  const handleFinish = () => {
    const secs = Math.max(
      1,
      Math.round((Date.now() - setStartRef.current) / 1000),
    );
    setElapsed(0);
    if (isTimed) {
      const cal = calcTimedCalories(currentExercise.met, bodyWeightKg, secs);
      commitAndAdvance({
        setNumber: setIdx + 1,
        weightKg: effectiveWeight(),
        reps: 0,
        durationSecs: secs,
        caloriesBurned: cal,
      });
      return;
    }
    pendingDurationRef.current = secs;
    setRepsInput("");
    setPhase("reps");
  };

  // ── Confirm reps and save the set ────────────────────────────────────────
  const handleRepsConfirm = () => {
    const reps = Math.max(1, parseInt(repsInput) || 1);
    const cal = calcSetCalories(currentExercise.met, bodyWeightKg, reps);
    commitAndAdvance({
      setNumber: setIdx + 1,
      weightKg: effectiveWeight(),
      reps,
      durationSecs: pendingDurationRef.current,
      caloriesBurned: cal,
    });
  };

  const advanceExercise = () => {
    setExIdx((i) => i + 1);
    setSetIdx(0);
    setWeightInput("");
    setPhase("weight");
  };

  const handleRestDone = useCallback(() => {
    const isLastSet = setIdx >= currentExercise.sets - 1;
    if (isLastSet) {
      setExIdx((i) => i + 1);
      setSetIdx(0);
      setWeightInput("");
      setPhase("weight");
    } else {
      setSetIdx((s) => s + 1);
      setPhase("weight");
    }
  }, [setIdx, currentExercise.sets]);

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
    if (finishedRef.current) return;
    finishedRef.current = true;
    // Read the latest snapshot from the ref — never call onFinish from inside
    // a state updater (see completedRef note above).
    const snap = completedRef.current;
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
        isTimed: ex.isTimed ?? isTimedReps(ex.reps),
      })),
    ];
    onFinish(buildSession(fullSnap, false));
  }, [exerciseOrder, exercises, onFinish, buildSession]);

  // ── Auto-finish when phase becomes done ──────────────────────────────────
  useEffect(() => {
    if (phase !== "done" || finishedRef.current) return;
    finishedRef.current = true;
    // Defer one tick so the final set state has flushed into completedRef
    // before snapshotting. Cancel on unmount so onFinish can't fire on a dead
    // component. Read from the ref — never call onFinish inside a state updater.
    const id = setTimeout(() => {
      onFinish(buildSession(completedRef.current, false));
    }, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const totalKcal = completed.reduce(
    (s, ex) => s + ex.sets.reduce((s2, set) => s2 + set.caloriesBurned, 0),
    0,
  );

  // ── Pre-workout rest setup screen ────────────────────────────────────────
  // Shown once before the first set so the user picks rest for this workout.
  if (!restConfigured) {
    const restPresets = [30, 60, 90, 120];
    return (
      <div className="flex flex-col gap-4 pb-8">
        {/* ── Day header ──────────────────────────────────────────────── */}
        <div
          className="rounded-2xl border px-4 py-3 flex items-center justify-between"
          style={{
            background: day.color + "12",
            borderColor: day.color + "33",
          }}
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
              {exerciseOrder.length} exercises
            </p>
          </div>
          <button
            onClick={onDiscard}
            className="shrink-0 px-3 py-1.5 rounded-xl font-mono text-[10px] uppercase tracking-widest text-muted border border-line hover:text-crimson hover:border-crimson/40 transition-colors active:scale-95"
          >
            Exit
          </button>
        </div>

        {/* ── Rest setup card ─────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-line px-4 py-4 flex flex-col gap-4">
          <div>
            <p className="font-display text-xl tracking-wide text-fore">
              Rest between sets
            </p>
            <p className="font-sans text-[11px] text-muted mt-0.5">
              Set your rest timer for this workout.
            </p>
          </div>

          {/* ── Presets ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-2">
            {restPresets.map((sec) => {
              const active = !restOff && sessionRestSecs === sec;
              return (
                <button
                  key={sec}
                  onClick={() => {
                    setRestOff(false);
                    setSessionRestSecs(sec);
                  }}
                  className="py-3 rounded-xl font-mono text-[11px] uppercase tracking-widest transition-all active:scale-95"
                  style={{
                    background: active
                      ? day.color + "20"
                      : "rgba(255,255,255,0.04)",
                    color: active ? day.color : "#8b8b9a",
                    border: `1px solid ${active ? day.color + "44" : "#2a2a35"}`,
                  }}
                >
                  {sec}s
                </button>
              );
            })}
          </div>

          {/* ── Custom seconds ────────────────────────────────────────── */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-1.5">
              Custom (seconds)
            </label>
            <input
              type="number"
              min="1"
              value={restOff ? "" : String(sessionRestSecs)}
              onChange={(e) => {
                setRestOff(false);
                setSessionRestSecs(Math.max(1, parseInt(e.target.value) || 1));
              }}
              placeholder="seconds"
              className="w-full bg-card2 rounded-xl border border-line px-4 py-3 font-sans text-xl text-fore outline-none focus:border-acid/60 transition-colors text-center"
            />
          </div>

          {/* ── No rest ───────────────────────────────────────────────── */}
          <button
            onClick={() => setRestOff(true)}
            className="w-full py-2.5 rounded-xl font-mono text-[11px] uppercase tracking-widest transition-all active:scale-95"
            style={{
              background: restOff ? "#2a2a35" : "rgba(255,255,255,0.04)",
              color: restOff ? "#e8e8ee" : "#8b8b9a",
              border: `1px solid ${restOff ? "#3a3a45" : "#2a2a35"}`,
            }}
          >
            No rest — advance immediately
          </button>

          {/* ── Start ─────────────────────────────────────────────────── */}
          <button
            onClick={() => {
              setRestConfigured(true);
              onWorkoutStart();
            }}
            className="w-full py-3.5 rounded-xl font-display text-xl tracking-widest text-surface transition-all active:scale-95"
            style={{ background: day.color }}
          >
            START WORKOUT
          </button>
        </div>
      </div>
    );
  }

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
        {/* ── Exit (no save) — stays top-right, asks to confirm ─────────── */}
        <button
          onClick={() => setShowExitConfirm(true)}
          className="shrink-0 px-3 py-1.5 rounded-xl font-mono text-[10px] uppercase tracking-widest text-muted border border-line hover:text-crimson hover:border-crimson/40 transition-colors active:scale-95"
        >
          Exit
        </button>
      </div>

      {/* ── Exit confirmation banner ──────────────────────────────────── */}
      {showExitConfirm && (
        <div className="rounded-2xl border border-crimson/40 bg-crimson/10 px-4 py-3 flex flex-col gap-2.5">
          <p className="font-sans text-sm text-fore">
            Are you sure? This workout data will not be saved.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowExitConfirm(false)}
              className="flex-1 py-2.5 rounded-xl font-mono text-[11px] uppercase tracking-widest text-muted border border-line hover:text-fore transition-colors active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={onDiscard}
              className="flex-1 py-2.5 rounded-xl font-mono text-[11px] uppercase tracking-widest text-crimson border border-crimson/40 hover:bg-crimson/10 transition-colors active:scale-95"
            >
              Discard
            </button>
          </div>
        </div>
      )}

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
              <YouTubeIcon size={18} />
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
                {isTimed
                  ? `holding · target ${currentExercise.reps}`
                  : isBW
                    ? `in progress · BW ${parseFloat(weightInput) > 0 ? `+ ${weightInput} kg` : `(${bodyWeightKg} kg)`}`
                    : `in progress · ${weightInput || "0"} kg`}
              </p>
            </div>
            <button
              onClick={handleFinish}
              style={{ background: day.color }}
              className="w-full py-3.5 rounded-xl font-display text-xl tracking-widest text-fore border border-slate-900 transition-all active:scale-95"
            >
              {isTimed ? "FINISH HOLD" : "FINISH SET"}
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
                className="w-full py-3.5 rounded-xl font-display text-xl tracking-widest text-surface transition-all active:scale-95 disabled:opacity-40"
                style={{ background: day.color }}
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
              durationSecs={sessionRestSecs}
              color={day.color}
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
                    background: isDone ? day.color : "rgba(255,255,255,0.06)",
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
                  <YouTubeIcon />
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
      {/* ── Finish urgently (saves progress) — below workout info ──────── */}
      {showFinishConfirm ? (
        <div className="rounded-2xl border border-line bg-card px-4 py-3 flex flex-col gap-2.5">
          <p className="font-sans text-sm text-fore">
            Finish workout now? Your progress will be saved.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFinishConfirm(false)}
              className="flex-1 py-2.5 rounded-xl font-mono text-[11px] uppercase tracking-widest text-muted border border-line hover:text-fore transition-colors active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleUrgentSave}
              className="flex-1 py-2.5 rounded-xl font-mono text-[11px] uppercase tracking-widest text-surface transition-all active:scale-95"
              style={{ background: day.color }}
            >
              Finish & Save
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowFinishConfirm(true)}
          className="w-full py-3 rounded-xl font-display text-base tracking-widest text-surface transition-all active:scale-95"
          style={{ background: day.color }}
        >
          Finish Workout Now
        </button>
      )}
    </div>
  );
}
