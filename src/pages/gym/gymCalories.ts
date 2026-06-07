// ── Calorie estimation ─────────────────────────────────────────────────────
// Formula: kcal = MET × bodyWeightKg × (reps × 3s / 3600)
// 3 seconds per rep is a standard time-under-tension estimate.
// Reps-based avoids inflation from slow stopwatch taps.

export function calcSetCalories(
  met: number,
  bodyWeightKg: number,
  reps: number,
): number {
  const SECS_PER_REP = 3;
  const hours = (reps * SECS_PER_REP) / 3600;
  return Math.round(met * bodyWeightKg * hours * 10) / 10;
}

// ── Timed-exercise calorie estimation ──────────────────────────────────────
// Isometric holds (plank, L-sit…) are measured in seconds, so calories come
// straight from the actual hold duration rather than a reps × 3s estimate.
export function calcTimedCalories(
  met: number,
  bodyWeightKg: number,
  durationSecs: number,
): number {
  const hours = durationSecs / 3600;
  return Math.round(met * bodyWeightKg * hours * 10) / 10;
}

// ── Detect a time-based exercise from its reps string ──────────────────────
// Holds encode their target in seconds ("60s", "30–45s", "10–20s"). Used to
// auto-derive isTimed when an exercise has no explicit flag set.
export function isTimedReps(reps: string): boolean {
  return /s\s*$/i.test(reps.trim());
}

// ── MET reference values ───────────────────────────────────────────────────
export const MET = {
  compoundHeavy:  5.0,
  compoundMedium: 4.0,
  isolation:      3.5,
  bodyweight:     4.5,
  hiit:           9.0,
  cardioModerate: 6.0,
} as const;

// ── Estimate total session calories ───────────────────────────────────────
export function estimateSessionCalories(
  totalSecs: number,
  avgMet: number,
  bodyWeightKg: number,
): number {
  return Math.round(avgMet * bodyWeightKg * (totalSecs / 3600));
}
