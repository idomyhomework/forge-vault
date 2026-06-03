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
