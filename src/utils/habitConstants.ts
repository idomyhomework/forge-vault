import type { Habit } from "../types";

// ── Week days ─────────────────────────────────────────────────────────────────
export const DAYS = ["L", "M", "X", "J", "V", "S", "D"];

// ── XP reward per check ───────────────────────────────────────────────────────
export const XP_PER_CHECK = 25;

// ── Color presets ─────────────────────────────────────────────────────────────
export const COLOR_PRESETS = [
  { color: "bg-sky-400",     accentHex: "#38bdf8" },
  { color: "bg-cyan-400",    accentHex: "#22d3ee" },
  { color: "bg-emerald-400", accentHex: "#34d399" },
  { color: "bg-pink-400",    accentHex: "#f472b6" },
  { color: "bg-violet-400",  accentHex: "#a78bfa" },
  { color: "bg-orange-400",  accentHex: "#fb923c" },
  { color: "bg-yellow-400",  accentHex: "#facc15" },
  { color: "bg-rose-400",    accentHex: "#fb7185" },
];

// ── Initial habits ────────────────────────────────────────────────────────────
export const INITIAL_HABITS: Habit[] = [
  {
    id: "wake",
    label: "Despertar a las 05:00",
    icon: "clock",
    color: "bg-sky-400",
    accentHex: "#38bdf8",
    checks: [false, false, false, false, false, false, false],
  },
  {
    id: "gym",
    label: "Gimnasio",
    icon: "dumbbell",
    color: "bg-cyan-400",
    accentHex: "#22d3ee",
    checks: [false, false, false, false, false, false, false],
  },
  {
    id: "reading",
    label: "Lectura / Aprendizaje",
    icon: "bookOpen",
    color: "bg-emerald-400",
    accentHex: "#34d399",
    checks: [false, false, false, false, false, false, false],
  },
  {
    id: "planning",
    label: "Planificación del día",
    icon: "calendar",
    color: "bg-pink-400",
    accentHex: "#f472b6",
    checks: [false, false, false, false, false, false, false],
  },
];
