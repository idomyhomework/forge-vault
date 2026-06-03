import { motion } from "framer-motion";
import { DAYS } from "../../utils/habitConstants";
import type { Habit } from "../../types";

// ── Consistency sparkline chart ────────────────────────────────────────────
export default function ConsistencyChart({
  habits,
  accentHex,
}: {
  habits: Habit[];
  accentHex: string;
}) {
  const W = 320;
  const H = 72;
  const PAD = 16;

  const ratios = DAYS.map((_, d) => {
    const done = habits.filter((h) => h.checks[d]).length;
    return habits.length ? done / habits.length : 0;
  });

  const pts = ratios.map((r, i) => {
    const x = PAD + (i / (DAYS.length - 1)) * (W - PAD * 2);
    const y = H - PAD - r * (H - PAD * 2);
    return { x, y };
  });

  const pathD = pts
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;
  const TRANSITION = { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 72 }}>
      <defs>
        <linearGradient id="areaGradH" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accentHex} stopOpacity="0.25" />
          <stop offset="100%" stopColor={accentHex} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={areaD}
        animate={{ d: areaD }}
        transition={TRANSITION}
        fill="url(#areaGradH)"
      />
      <motion.path
        d={pathD}
        animate={{ d: pathD }}
        transition={TRANSITION}
        fill="none"
        stroke={accentHex}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          animate={{ cy: p.y }}
          transition={TRANSITION}
          r="4"
          fill="#0a0a0c"
          stroke={accentHex}
          strokeWidth="2"
        />
      ))}
      {pts.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={H - 1}
          textAnchor="middle"
          fontSize="9"
          fill="#8b8b9a"
          fontFamily="Space Mono, monospace"
        >
          {DAYS[i]}
        </text>
      ))}
    </svg>
  );
}
