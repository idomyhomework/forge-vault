import { useState, useMemo, useRef, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import type { WorkoutSession } from "../gymTypes";

// ── ExercisePicker component ───────────────────────────────────────────────
function ExercisePicker({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-card2 rounded-xl border border-line px-3 py-2.5 font-sans text-sm text-fore outline-none focus:border-acid/60 transition-colors flex items-center justify-between gap-2 text-left"
      >
        <span className="truncate">{value}</span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul className="absolute z-50 mt-1 w-full max-w-full bg-card2 border border-line rounded-xl overflow-y-auto max-h-52 shadow-xl">
          {options.map((n) => (
            <li key={n}>
              <button
                type="button"
                onClick={() => { onChange(n); setOpen(false); }}
                className={`w-full text-left px-3 py-2.5 font-sans text-sm transition-colors hover:bg-white/5 active:bg-white/10 truncate ${
                  n === value ? "text-fore bg-white/5" : "text-muted"
                }`}
              >
                {n}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Period options ─────────────────────────────────────────────────────────
const PERIODS = [
  { label: "7d",  days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "All", days: 9999 },
] as const;
type Period = (typeof PERIODS)[number]["label"];

// ── Custom tooltip ─────────────────────────────────────────────────────────
function ChartTooltip({
  active, payload, label, unit,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card2 border border-line rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="font-mono text-muted text-[9px] mb-0.5">{label}</p>
      <p className="font-display text-base text-fore">
        {payload[0].value}{" "}
        <span className="font-sans text-[10px] text-muted">{unit}</span>
      </p>
    </div>
  );
}

// ── ProgressCharts component ───────────────────────────────────────────────
export default function ProgressCharts({
  sessions,
  color,
}: {
  sessions: WorkoutSession[];
  color: string;
}) {
  const [period, setPeriod] = useState<Period>("30d");
  const [tab, setTab] = useState<"weight" | "reps" | "calories" | "volume">(
    "weight",
  );
  const [selectedExercise, setSelectedExercise] = useState("");
  const [selectedSetIdx, setSelectedSetIdx] = useState(0);

  // ── Filter by period ─────────────────────────────────────────────────────
  const cutoff = useMemo(() => {
    const days = PERIODS.find((p) => p.label === period)?.days ?? 30;
    if (days >= 9999) return "0000-00-00";
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  }, [period]);

  const filtered = useMemo(
    () => sessions.filter((s) => !s.isPartial && s.date >= cutoff),
    [sessions, cutoff],
  );

  // ── Unique exercise names ────────────────────────────────────────────────
  const exerciseNames = useMemo(() => {
    const set = new Set<string>();
    filtered.forEach((s) => s.exercises.forEach((e) => set.add(e.exerciseName)));
    return Array.from(set).sort();
  }, [filtered]);

  const exercise = selectedExercise || exerciseNames[0] || "";

  // ── Chart data ───────────────────────────────────────────────────────────
  const weightData = useMemo(() => {
    if (!exercise) return [];
    return filtered
      .filter((s) => s.exercises.some((e) => e.exerciseName === exercise))
      .map((s) => {
        const ex = s.exercises.find((e) => e.exerciseName === exercise)!;
        return {
          date: s.date.slice(5),
          value: Math.max(...ex.sets.map((set) => set.weightKg), 0),
        };
      });
  }, [filtered, exercise]);

  const calorieData = useMemo(
    () => filtered.map((s) => ({ date: s.date.slice(5), value: s.totalCaloriesBurned })),
    [filtered],
  );

  // ── Is the selected exercise time-based? ─────────────────────────────────
  // Read from the most recent session that logged it (isTimed snapshot).
  const exTimed = useMemo(() => {
    if (!exercise) return false;
    for (let i = filtered.length - 1; i >= 0; i--) {
      const ex = filtered[i].exercises.find((e) => e.exerciseName === exercise);
      if (ex) return ex.isTimed ?? false;
    }
    return false;
  }, [filtered, exercise]);

  // ── Average reps (or seconds) per set, one point per session ─────────────
  const repsData = useMemo(() => {
    if (!exercise) return [];
    return filtered
      .filter((s) =>
        s.exercises.some(
          (e) => e.exerciseName === exercise && e.sets.length > 0,
        ),
      )
      .map((s) => {
        const ex = s.exercises.find((e) => e.exerciseName === exercise)!;
        const total = ex.sets.reduce(
          (sum, set) => sum + (exTimed ? set.durationSecs : set.reps),
          0,
        );
        return {
          date: s.date.slice(5),
          value: Math.round(total / ex.sets.length),
        };
      });
  }, [filtered, exercise, exTimed]);

  // ── Sets of the exercise's most recent session (for the set buttons) ─────
  const latestSets = useMemo(() => {
    if (!exercise) return [];
    for (let i = filtered.length - 1; i >= 0; i--) {
      const ex = filtered[i].exercises.find((e) => e.exerciseName === exercise);
      if (ex && ex.sets.length > 0) return ex.sets;
    }
    return [];
  }, [filtered, exercise]);

  const volumeData = useMemo(() => {
    // Volume (weight × reps) is meaningless for timed holds.
    if (!exercise || exTimed) return [];
    return filtered
      .filter((s) => s.exercises.some((e) => e.exerciseName === exercise))
      .map((s) => {
        const ex = s.exercises.find((e) => e.exerciseName === exercise)!;
        const vol = ex.sets.reduce((sum, set) => sum + set.weightKg * (set.reps ?? 0), 0);
        return { date: s.date.slice(5), value: Math.round(vol) };
      });
  }, [filtered, exercise, exTimed]);

  const chartData =
    tab === "weight"
      ? weightData
      : tab === "reps"
        ? repsData
        : tab === "calories"
          ? calorieData
          : volumeData;
  const chartUnit =
    tab === "weight"
      ? "kg"
      : tab === "reps"
        ? exTimed
          ? "s"
          : "reps"
        : tab === "calories"
          ? "kcal"
          : "kg·sets";
  const chartColor =
    tab === "weight"
      ? "#00C6FF"
      : tab === "reps"
        ? "#FFD166"
        : tab === "calories"
          ? "#FF6B6B"
          : "#A8FF78";

  // ── Keep the selected set index within the latest session's range ────────
  const safeSetIdx = selectedSetIdx < latestSets.length ? selectedSetIdx : 0;

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16 text-muted">
        <div className="text-4xl mb-3">📈</div>
        <p className="font-sans text-sm">Complete your first workout to see progress charts.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Period selector ───────────────────────────────────────────── */}
      <div className="flex gap-1 bg-card rounded-2xl border border-line p-1">
        {PERIODS.map((p) => (
          <button
            key={p.label}
            onClick={() => setPeriod(p.label)}
            className="flex-1 py-1.5 rounded-xl font-mono text-[10px] uppercase tracking-widest transition-all active:scale-95"
            style={{
              background: period === p.label ? color + "20" : undefined,
              color: period === p.label ? color : "#8b8b9a",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Metric tabs ───────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-card rounded-2xl border border-line p-1">
        {(["weight", "reps", "calories", "volume"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-1.5 rounded-xl font-mono text-[10px] uppercase tracking-widest transition-all active:scale-95"
            style={{
              background: tab === t ? "rgba(255,255,255,0.06)" : undefined,
              color: tab === t ? "#e8e8ee" : "#8b8b9a",
            }}
          >
            {t === "weight"
              ? "Weight"
              : t === "reps"
                ? "Reps"
                : t === "calories"
                  ? "Kcal"
                  : "Volume"}
          </button>
        ))}
      </div>

      {/* ── Exercise picker (not for calories) ────────────────────────── */}
      {tab !== "calories" && exerciseNames.length > 0 && (
        <ExercisePicker
          value={exercise}
          options={exerciseNames}
          onChange={setSelectedExercise}
        />
      )}

      {/* ── Chart ─────────────────────────────────────────────────────── */}
      {chartData.length === 0 ? (
        <div className="text-center py-10 text-muted">
          <p className="font-sans text-sm">
            {tab === "volume" && exTimed
              ? "Volume isn't tracked for timed holds — see the Reps tab for seconds."
              : "No data for this period."}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-line px-2 py-4">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted px-2 mb-3">
            {tab === "weight"
              ? `Peak weight — ${exercise}`
              : tab === "reps"
                ? `${exTimed ? "Avg hold per set" : "Avg reps per set"} — ${exercise}`
                : tab === "calories"
                  ? "Calories per session"
                  : `Volume — ${exercise}`}
          </p>
          <ResponsiveContainer width="100%" height={180}>
            {tab === "calories" ? (
              <BarChart data={chartData} margin={{ left: -20, right: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
                <XAxis dataKey="date" tick={{ fill: "#8b8b9a", fontSize: 9, fontFamily: "Space Mono" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#8b8b9a", fontSize: 9, fontFamily: "Space Mono" }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip unit={chartUnit} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="value" fill="#d4ff3f" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ left: -20, right: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
                <XAxis dataKey="date" tick={{ fill: "#8b8b9a", fontSize: 9, fontFamily: "Space Mono" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#8b8b9a", fontSize: 9, fontFamily: "Space Mono" }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip unit={chartUnit} />} />
                <Line type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} dot={{ fill: chartColor, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: chartColor }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Per-set breakdown (latest session) ────────────────────────── */}
      {tab === "reps" && latestSets.length > 0 && (
        <div className="bg-card rounded-2xl border border-line px-3 py-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-2">
            Last session — tap a set
          </p>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {latestSets.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedSetIdx(i)}
                className="px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all active:scale-95"
                style={{
                  background: safeSetIdx === i ? color + "20" : "rgba(255,255,255,0.04)",
                  color: safeSetIdx === i ? color : "#8b8b9a",
                }}
              >
                Set {i + 1}
              </button>
            ))}
          </div>
          <p className="font-display text-base text-fore">
            Set {safeSetIdx + 1} —{" "}
            {exTimed
              ? `${latestSets[safeSetIdx].durationSecs}s hold`
              : `${latestSets[safeSetIdx].reps} reps`}
            <span className="font-sans text-[11px] text-muted ml-1.5">
              @ {latestSets[safeSetIdx].weightKg} kg
            </span>
          </p>
        </div>
      )}

      {/* ── Summary stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Sessions", value: filtered.length, unit: "" },
          { label: "Total kcal", value: Math.round(filtered.reduce((s, se) => s + se.totalCaloriesBurned, 0)), unit: "kcal" },
          {
            label: "Avg time",
            value: filtered.length
              ? Math.round(filtered.reduce((s, se) => s + se.totalDurationSecs, 0) / filtered.length / 60)
              : 0,
            unit: "min",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border border-line p-3 text-center">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted">{stat.label}</p>
            <p className="font-display text-xl text-fore leading-none mt-1">
              {stat.value}
              {stat.unit && <span className="font-sans text-[10px] text-muted ml-0.5">{stat.unit}</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
