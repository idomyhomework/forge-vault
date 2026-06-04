import { useEffect, useRef, useState } from "react";

// ── RestTimer component ────────────────────────────────────────────────────
export default function RestTimer({
  durationSecs,
  onDone,
  onSkip,
}: {
  durationSecs: number;
  onDone: () => void;
  onSkip: () => void;
}) {
  const finishAt = useRef(Date.now() + durationSecs * 1000);
  const [remaining, setRemaining] = useState(durationSecs);

  // ── Wall-clock interval ──────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const left = Math.ceil((finishAt.current - Date.now()) / 1000);
      if (left <= 0) {
        clearInterval(id);
        setRemaining(0);
        onDone();
        return;
      }
      setRemaining(left);
    }, 500);
    return () => clearInterval(id);
  }, [onDone]);

  // ── SVG ring geometry ────────────────────────────────────────────────────
  const circ = 2 * Math.PI * 44;
  const offset = circ - circ * (remaining / durationSecs);

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
        Rest
      </p>

      <div className="relative">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
          <circle
            cx="50" cy="50" r="44" fill="none" stroke="#44FF88"
            strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.9s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-display text-3xl leading-none text-emerald-400">{remaining}</p>
          <p className="font-mono text-[9px] text-muted uppercase tracking-widest">sec</p>
        </div>
      </div>

      <button
        onClick={onSkip}
        className="px-8 py-2 rounded-xl font-mono text-[11px] uppercase tracking-widest text-muted border border-line hover:text-fore transition-colors active:scale-95"
      >
        Skip Rest →
      </button>
    </div>
  );
}
