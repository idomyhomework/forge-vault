import type { NoteColor } from "../types";

// ── Color palette ─────────────────────────────────────────────────────────────
export const COLORS: { value: NoteColor; hex: string }[] = [
  { value: "fore",       hex: "#e8e8ee" },
  { value: "acid",       hex: "#d4ff3f" },
  { value: "muted",      hex: "#8b8b9a" },
  { value: "crimson",    hex: "#ff2e74" },
  { value: "blue-acc",   hex: "#3fa9ff" },
  { value: "orange-acc", hex: "#ff5722" },
  { value: "purple-acc", hex: "#9d6bff" },
];

// ── Color hex map ─────────────────────────────────────────────────────────────
export const COLOR_HEX: Record<NoteColor, string> = {
  fore:         "#e8e8ee",
  acid:         "#d4ff3f",
  muted:        "#8b8b9a",
  crimson:      "#ff2e74",
  "blue-acc":   "#3fa9ff",
  "orange-acc": "#ff5722",
  "purple-acc": "#9d6bff",
};
