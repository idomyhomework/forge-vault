// ── Gender ─────────────────────────────────────────────────────────────────
export type Gender = "male" | "female" | "unisex";

// ── Goal & level ───────────────────────────────────────────────────────────
export type ProgramGoal = "strength" | "aesthetic" | "toning" | "fat_loss" | "beginner";
export type ProgramLevel = "beginner" | "intermediate" | "advanced";

// ── Exercise definition (in a built-in program) ───────────────────────────
export interface ExerciseDef {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: string;
  notes: string;
  met: number;
  rec?: boolean;
  // Isometric / time-based exercise (plank, L-sit…): tracked in seconds held,
  // not repetitions. When omitted, derived from the reps string ("60s" → true).
  isTimed?: boolean;
}

// ── Day definition inside a built-in program ──────────────────────────────
export interface ProgramDayDef {
  label: string;
  name: string;
  focus: string;
  color: string;
  exercises: ExerciseDef[];
}

// ── Built-in program template ──────────────────────────────────────────────
export interface TrainingProgram {
  id: string;
  name: string;
  tagline: string;
  gender: Gender;
  goal: ProgramGoal;
  level: ProgramLevel;
  daysOptions: number[];
  color: string;
  days: ProgramDayDef[];
}

// ── User-customized exercise ───────────────────────────────────────────────
export interface UserExercise {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: string;
  notes: string;
  met: number;
  enabled: boolean;
  // Tracked in seconds held instead of reps (plank, hollow-body hold…).
  isTimed?: boolean;
}

// ── User-customized day ────────────────────────────────────────────────────
export interface UserProgramDay {
  label: string;
  name: string;
  focus: string;
  color: string;
  exercises: UserExercise[];
}

// ── User-configured program instance ──────────────────────────────────────
export interface UserProgramConfig {
  id: string;
  programId: string;
  programName: string;
  daysPerWeek: number;
  scheduledWeekDays: number[];
  days: UserProgramDay[];
  startedAt: string;
  lastTrainedAt?: string;
}

// ── User profile ───────────────────────────────────────────────────────────
export interface GymUserProfile {
  gender: Gender;
  bodyWeightKg: number;
}

// ── Preferences ────────────────────────────────────────────────────────────
export interface GymPreferences {
  showRestTimer: boolean;
  restDurationSecs: number;
}

// ── Session records ────────────────────────────────────────────────────────
export interface SetRecord {
  setNumber: number;
  weightKg: number;
  reps: number;
  durationSecs: number;
  caloriesBurned: number;
}

export interface CompletedExercise {
  exerciseId: string;
  exerciseName: string;
  muscle: string;
  sets: SetRecord[];
  // Snapshot of the exercise's timed flag at session time, so history and
  // charts know to read seconds (durationSecs) instead of reps.
  isTimed?: boolean;
}

export interface WorkoutSession {
  id: string;
  configId: string;
  programId: string;
  date: string;
  dayIndex: number;
  dayName: string;
  exercises: CompletedExercise[];
  totalDurationSecs: number;
  totalCaloriesBurned: number;
  isPartial: boolean;
}

// ── Active exercise phase ──────────────────────────────────────────────────
export type ExercisePhase = "idle" | "active" | "resting" | "done";
