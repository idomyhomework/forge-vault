import { useState, useEffect, useRef } from "react";
import { HC, HIIT_POOL, WORK, REST, DEFAULT_HIIT_SEL } from "../gymData";

// ── Types ──────────────────────────────────────────────────────────────────
type HiitPhase = "idle" | "work" | "rest" | "done";

// ── HiitBuilder ────────────────────────────────────────────────────────────
function HiitBuilder({
  hiitSel,
  toggleHiit,
  resetHiitSel,
}: {
  hiitSel: Set<number>;
  toggleHiit: (idx: number) => void;
  resetHiitSel: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm font-semibold text-fore">
          {hiitSel.size} exercises
        </span>
        <button
          onClick={resetHiitSel}
          className="px-3 py-1 rounded-lg border border-line font-sans text-xs text-muted hover:text-fore transition-colors"
        >
          ↩ Reset
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 pb-2">
        {HIIT_POOL.map((ex, idx) => {
          const sel = hiitSel.has(idx);
          return (
            <div
              key={idx}
              onClick={() => toggleHiit(idx)}
              className="rounded-xl p-3 cursor-pointer border bg-card2 transition-all select-none hover:-translate-y-px active:scale-[0.98]"
              style={
                sel
                  ? { background: HC + "14", borderColor: HC + "88" }
                  : { borderColor: "transparent" }
              }
            >
              <div className="flex items-start gap-2 mb-1.5">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    background: sel ? HC : "rgba(255,255,255,0.07)",
                    fontSize: sel ? 10 : 13,
                    color: sel ? "#000" : undefined,
                  }}
                >
                  {sel ? "✓" : ex.emoji}
                </div>
                <span
                  className={`flex-1 font-sans text-xs font-semibold leading-snug ${sel ? "text-fore" : "text-muted"}`}
                >
                  {ex.name}
                </span>
              </div>
              <p className="font-sans text-[10px] text-muted leading-snug pl-7">
                {ex.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── HiitExerciseList ───────────────────────────────────────────────────────
function HiitExerciseList({
  hiitCircuit,
  phase,
  round,
}: {
  hiitCircuit: (typeof HIIT_POOL)[number][];
  phase: HiitPhase;
  round: number;
}) {
  return (
    <div className="bg-card rounded-2xl border border-line overflow-hidden">
      {hiitCircuit.map((ex, i) => {
        const isActive = phase === "work" && i === round;
        const isDone = i < round || phase === "done";
        return (
          <div
            key={i}
            className="px-4 py-3 border-b border-line last:border-b-0 transition-colors"
            style={isActive ? { background: HC + "12" } : undefined}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{
                  background: isActive
                    ? HC
                    : isDone
                      ? "#44FF8828"
                      : "rgba(255,255,255,0.06)",
                  fontSize: isDone ? 10 : 13,
                }}
              >
                {isDone ? "✓" : ex.emoji}
              </div>
              <div className="flex-1">
                <p
                  className={`font-sans text-xs font-semibold ${isDone ? "text-muted" : "text-fore"}`}
                >
                  {ex.name}
                </p>
                <p className="font-sans text-[10px] text-muted mt-0.5">
                  {ex.desc}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <span
                  className="px-2 py-0.5 rounded font-mono text-[10px] font-bold"
                  style={{ background: HC + "1a", color: HC }}
                >
                  40s
                </span>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-white/5 text-muted">
                  20s
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── HiitView ───────────────────────────────────────────────────────────────
export default function HiitView() {
  const [hiitBuilderMode, setHiitBuilderMode] = useState(false);
  const [hiitSel, setHiitSel] = useState(new Set(DEFAULT_HIIT_SEL));
  const [phase, setPhase] = useState<HiitPhase>("idle");
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(WORK);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Absolute deadline (ms) for the current phase — survives app backgrounding
  const finishAt = useRef(0);
  // Phase to restore when resuming from a pause
  const resumePhaseRef = useRef<"work" | "rest">("work");

  // ── HIIT circuit ─────────────────────────────────────────────────────────
  const hiitCircuit = [...hiitSel]
    .sort((a, b) => a - b)
    .map((i) => HIIT_POOL[i]);
  const totalSec = hiitCircuit.length * (WORK + REST);

  const toggleHiit = (idx: number) => {
    setHiitSel((prev) => {
      const n = new Set(prev);
      if (n.has(idx)) n.delete(idx);
      else n.add(idx);
      return n;
    });
  };
  const resetHiitSel = () => setHiitSel(new Set(DEFAULT_HIIT_SEL));

  // ── HIIT timer (wall-clock so it survives backgrounding) ─────────────────
  useEffect(() => {
    if (phase !== "work" && phase !== "rest") return;
    // Anchor the deadline to the current remaining time. This covers a fresh
    // phase (timeLeft = WORK/REST), a phase transition, and resume-from-pause.
    finishAt.current = Date.now() + timeLeft * 1000;
    intervalRef.current = setInterval(() => {
      const left = Math.ceil((finishAt.current - Date.now()) / 1000);
      if (left > 0) {
        setTimeLeft(left);
        return;
      }
      clearInterval(intervalRef.current ?? undefined);
      if (phase === "work") {
        if (round >= hiitCircuit.length - 1) {
          setPhase("done");
          setTimeLeft(0);
        } else {
          setTimeLeft(REST);
          setPhase("rest");
        }
      } else {
        setRound((r) => r + 1);
        setTimeLeft(WORK);
        setPhase("work");
      }
    }, 500);
    return () => clearInterval(intervalRef.current ?? undefined);
    // timeLeft is intentionally omitted: the deadline is re-anchored only when
    // the phase or round changes, not on every per-second tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round, hiitCircuit.length]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const startHiit = () => {
    setRound(0);
    setTimeLeft(WORK);
    setPhase("work");
  };
  const resetHiitTimer = () => {
    clearInterval(intervalRef.current ?? undefined);
    setPhase("idle");
    setRound(0);
    setTimeLeft(WORK);
  };
  const pauseHiit = () => {
    clearInterval(intervalRef.current ?? undefined);
    resumePhaseRef.current = phase === "rest" ? "rest" : "work";
    setPhase("idle");
  };
  const resumeHiit = () => setPhase(resumePhaseRef.current);

  // ── Timer geometry ────────────────────────────────────────────────────────
  const circ = 2 * Math.PI * 54;
  const timerMax = phase === "rest" ? REST : WORK;
  const strokeOffset =
    phase === "idle" ? circ : circ - circ * (timeLeft / timerMax);
  const elapsed =
    round * (WORK + REST) +
    (phase === "work"
      ? WORK - timeLeft
      : phase === "rest"
        ? WORK + REST - timeLeft
        : 0);
  const overallPct =
    phase === "done"
      ? 100
      : Math.min(100, Math.round((elapsed / totalSec) * 100));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {/* -- HIIT header -- */}
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="flex-1 rounded-2xl border px-4 py-3"
          style={{ background: HC + "14", borderColor: HC + "33" }}
        >
          <h3
            className="font-display text-xl tracking-wide leading-none mb-1"
            style={{ color: HC }}
          >
            HIIT Fat Burn
          </h3>
          <p className="font-sans text-[11px] text-muted">
            {hiitCircuit.length} exercises · 40s work / 20s rest · ~
            {Math.round(totalSec / 60)} min
          </p>
        </div>
        <button
          onClick={() => setHiitBuilderMode((b) => !b)}
          className="shrink-0 px-3 py-1.5 rounded-lg font-mono text-[11px] uppercase tracking-wider border transition-all active:scale-95"
          style={{
            borderColor: hiitBuilderMode ? HC + "99" : undefined,
            background: hiitBuilderMode ? HC + "20" : undefined,
            color: hiitBuilderMode ? HC : undefined,
          }}
        >
          <span className={!hiitBuilderMode ? "text-muted" : ""}>
            {hiitBuilderMode ? "✓ Routine" : "⚙ Build"}
          </span>
        </button>
      </div>

      {/* -- Builder -- */}
      {hiitBuilderMode && (
        <HiitBuilder
          hiitSel={hiitSel}
          toggleHiit={toggleHiit}
          resetHiitSel={resetHiitSel}
        />
      )}

      {/* -- Workout -- */}
      {!hiitBuilderMode && (
        <div className="flex flex-col gap-4">
          <div
            className={`bg-card rounded-2xl border text-center px-5 py-6 transition-all ${phase === "work" ? "gym-glow" : ""}`}
            style={{
              borderColor:
                phase === "work"
                  ? HC + "55"
                  : phase === "rest"
                    ? "#44FF8840"
                    : undefined,
            }}
          >
            {phase === "done" ? (
              <div className="flex flex-col items-center gap-3">
                <div className="text-4xl">🏁</div>
                <p className="font-display text-2xl tracking-widest text-emerald-400">
                  Circuit Complete!
                </p>
                <button
                  onClick={resetHiitTimer}
                  className="mt-1 px-8 py-2.5 rounded-xl font-display text-base tracking-widest text-fore transition-all active:scale-95"
                  style={{ background: HC }}
                >
                  Repeat
                </button>
              </div>
            ) : (
              <>
                <div className="min-h-[60px] flex flex-col items-center justify-center mb-4">
                  {phase === "idle" && (
                    <p className="font-display text-lg tracking-widest text-white/20">
                      Ready to burn
                    </p>
                  )}
                  {phase === "rest" && (
                    <>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 mb-1">
                        Rest · Next:
                      </p>
                      <p className="font-display text-xl tracking-wide text-fore">
                        {hiitCircuit[round + 1]?.emoji}{" "}
                        {hiitCircuit[round + 1]?.name}
                      </p>
                    </>
                  )}
                  {phase === "work" && (
                    <>
                      <p
                        className="font-mono text-[10px] uppercase tracking-widest mb-1 gym-pulse"
                        style={{ color: HC }}
                      >
                        ▶ {round + 1}/{hiitCircuit.length}
                      </p>
                      <p className="font-display text-xl tracking-wide text-fore">
                        {hiitCircuit[round]?.emoji} {hiitCircuit[round]?.name}
                      </p>
                      <p className="font-sans text-[11px] text-muted mt-1">
                        {hiitCircuit[round]?.desc}
                      </p>
                    </>
                  )}
                </div>
                <div className="relative inline-block mb-4">
                  <svg width="120" height="120" viewBox="0 0 124 124">
                    <circle
                      cx="62"
                      cy="62"
                      r="54"
                      fill="none"
                      stroke="rgba(255,255,255,0.07)"
                      strokeWidth="8"
                    />
                    {phase !== "idle" && (
                      <circle
                        cx="62"
                        cy="62"
                        r="54"
                        fill="none"
                        stroke={phase === "rest" ? "#44FF88" : HC}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={strokeOffset}
                        transform="rotate(-90 62 62)"
                        style={{
                          transition:
                            "stroke-dashoffset 0.9s linear, stroke 0.3s",
                        }}
                      />
                    )}
                  </svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <p
                      className="font-display text-4xl leading-none"
                      style={{
                        color:
                          phase === "rest"
                            ? "#44FF88"
                            : phase === "work"
                              ? HC
                              : "rgba(255,255,255,0.2)",
                      }}
                    >
                      {phase === "idle" ? WORK : timeLeft}
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-muted mt-0.5">
                      {phase === "idle"
                        ? "sec"
                        : phase === "rest"
                          ? "rest"
                          : "work"}
                    </p>
                  </div>
                </div>
                {phase !== "idle" && (
                  <div className="mb-4 text-left">
                    <div className="flex justify-between mb-1">
                      <span className="font-mono text-[10px] text-muted">
                        Overall
                      </span>
                      <span className="font-mono text-[10px] text-fore">
                        {overallPct}%
                      </span>
                    </div>
                    <div className="h-1 bg-line rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-[width] duration-500"
                        style={{
                          width: `${overallPct}%`,
                          background: `linear-gradient(90deg,${HC},#FF8E53)`,
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex gap-2 justify-center">
                  {phase === "idle" && round === 0 && (
                    <button
                      onClick={startHiit}
                      className="px-10 py-2.5 rounded-xl font-display text-lg tracking-widest text-fore transition-all active:scale-95"
                      style={{ background: HC }}
                    >
                      Start
                    </button>
                  )}
                  {(phase === "work" || phase === "rest") && (
                    <button
                      onClick={pauseHiit}
                      className="px-6 py-2.5 rounded-xl font-display text-base tracking-widest text-fore bg-white/8 transition-all active:scale-95"
                    >
                      ⏸ Pause
                    </button>
                  )}
                  {phase === "idle" && round > 0 && (
                    <>
                      <button
                        onClick={resumeHiit}
                        className="px-6 py-2.5 rounded-xl font-display text-base tracking-widest text-fore transition-all active:scale-95"
                        style={{ background: HC }}
                      >
                        ▶ Resume
                      </button>
                      <button
                        onClick={resetHiitTimer}
                        className="px-5 py-2.5 rounded-xl font-display text-base text-muted bg-white/5 transition-all active:scale-95"
                      >
                        ↩
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <HiitExerciseList
            hiitCircuit={hiitCircuit}
            phase={phase}
            round={round}
          />
        </div>
      )}
    </div>
  );
}
