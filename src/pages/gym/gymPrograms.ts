import { MET } from "./gymCalories";
import type { TrainingProgram, UserProgramConfig, UserProgramDay } from "./gymTypes";

// ── Color palette per program ──────────────────────────────────────────────
const C = {
  cyan:    "#00C6FF",
  red:     "#FF6B6B",
  green:   "#A8FF78",
  orange:  "#F7971E",
  pink:    "#FF6EB4",
  violet:  "#9D6BFF",
  gold:    "#FFD700",
  teal:    "#00E5CC",
  crimson: "#FF2E74",
};

// ── V-Taper Aesthetic (Male · Intermediate · 4 days) ──────────────────────
const VTAPER: TrainingProgram = {
  id: "vtaper",
  name: "V-Taper Aesthetic",
  tagline: "Width · Definition · V shape",
  gender: "male",
  goal: "aesthetic",
  level: "intermediate",
  daysOptions: [4],
  color: C.cyan,
  days: [
    {
      label: "Day 1", name: "PULL — Wide Back", focus: "Lats · Biceps",
      color: C.cyan,
      exercises: [
        { id: "vt-1-1", name: "Wide-grip Pull-ups", muscle: "Lats", sets: 4, reps: "6–10", notes: "Priority #1 for V. Wider than shoulders.", met: MET.bodyweight, rec: true },
        { id: "vt-1-2", name: "Pronated Lat Pulldown", muscle: "Lats", sets: 4, reps: "8–12", notes: "Same movement pattern as pull-ups.", met: MET.compoundMedium },
        { id: "vt-1-3", name: "Barbell Row", muscle: "Lats", sets: 4, reps: "5–8", notes: "Flat back, elbows in. Mass builder.", met: MET.compoundHeavy, rec: true },
        { id: "vt-1-4", name: "DB Single-arm Row", muscle: "Lats", sets: 3, reps: "10–12", notes: "Full range. Slight torso rotation at top.", met: MET.compoundMedium, rec: true },
        { id: "vt-1-5", name: "Straight-arm Pulldown", muscle: "Lats", sets: 3, reps: "12–15", notes: "Pure lat isolation. Arms almost straight.", met: MET.isolation, rec: true },
        { id: "vt-1-6", name: "DB Pullover", muscle: "Lats", sets: 3, reps: "10–12", notes: "Huge lat stretch. Slow eccentric.", met: MET.isolation, rec: true },
        { id: "vt-1-7", name: "EZ-bar Curl", muscle: "Biceps", sets: 3, reps: "10–12", notes: "No swing. Controlled negative.", met: MET.isolation, rec: true },
        { id: "vt-1-8", name: "Hammer Curl", muscle: "Biceps", sets: 3, reps: "12–15", notes: "Works brachialis and forearm too.", met: MET.isolation },
        { id: "vt-1-9", name: "Face Pulls", muscle: "Rear Delt", sets: 3, reps: "15–20", notes: "Shoulder health + rear V. Rope attachment.", met: MET.isolation },
      ],
    },
    {
      label: "Day 2", name: "PUSH — Shoulders & Chest", focus: "Delts · Chest · Triceps",
      color: C.orange,
      exercises: [
        { id: "vt-2-1", name: "Standing Barbell OHP", muscle: "Shoulders", sets: 4, reps: "5–8", notes: "Key width builder. Progressive overload weekly.", met: MET.compoundHeavy, rec: true },
        { id: "vt-2-2", name: "DB Seated Press", muscle: "Shoulders", sets: 4, reps: "8–10", notes: "Greater ROM than barbell.", met: MET.compoundMedium },
        { id: "vt-2-3", name: "DB Lateral Raises", muscle: "Shoulders", sets: 4, reps: "12–15", notes: "Most important for V-shape. No cheating.", met: MET.isolation, rec: true },
        { id: "vt-2-4", name: "Cable Lateral Raise", muscle: "Shoulders", sets: 3, reps: "12–15", notes: "Constant tension. Superior for hypertrophy.", met: MET.isolation, rec: true },
        { id: "vt-2-5", name: "Incline Barbell Press", muscle: "Chest", sets: 3, reps: "8–10", notes: "45°. Upper chest + anterior delt.", met: MET.compoundHeavy, rec: true },
        { id: "vt-2-6", name: "Incline DB Press", muscle: "Chest", sets: 3, reps: "10–12", notes: "Better stretch than barbell version.", met: MET.compoundMedium },
        { id: "vt-2-7", name: "Cable Crossover (high)", muscle: "Chest", sets: 3, reps: "12–15", notes: "Lower chest contraction. Strong squeeze.", met: MET.isolation, rec: true },
        { id: "vt-2-8", name: "Dips (weighted)", muscle: "Triceps", sets: 3, reps: "8–12", notes: "Upright torso for more tricep focus.", met: MET.bodyweight, rec: true },
        { id: "vt-2-9", name: "Tricep Rope Pushdown", muscle: "Triceps", sets: 3, reps: "12–15", notes: "Elbow fixed. Spread rope at bottom.", met: MET.isolation },
      ],
    },
    {
      label: "Day 3", name: "LEGS — Full Lower Body", focus: "Quads · Hamstrings · Glutes",
      color: C.green,
      exercises: [
        { id: "vt-3-1", name: "Back Squat", muscle: "Quads", sets: 4, reps: "5–8", notes: "King of lower body. Parallel minimum.", met: MET.compoundHeavy, rec: true },
        { id: "vt-3-2", name: "Bulgarian Split Squat", muscle: "Quads", sets: 3, reps: "8–12", notes: "Unilateral. Detects and fixes imbalances.", met: MET.compoundMedium, rec: true },
        { id: "vt-3-3", name: "Leg Press", muscle: "Quads", sets: 3, reps: "10–12", notes: "Feet low = quads. Feet high = glutes.", met: MET.compoundMedium, rec: true },
        { id: "vt-3-4", name: "Leg Extension", muscle: "Quads", sets: 3, reps: "12–15", notes: "Isolation. Skip if knee issues.", met: MET.isolation },
        { id: "vt-3-5", name: "Romanian Deadlift", muscle: "Hamstrings", sets: 3, reps: "10–12", notes: "Hip hinge. Very controlled stretch.", met: MET.compoundHeavy, rec: true },
        { id: "vt-3-6", name: "Lying Leg Curl", muscle: "Hamstrings", sets: 3, reps: "12–15", notes: "Full range. Slow negative.", met: MET.isolation, rec: true },
        { id: "vt-3-7", name: "Hip Thrust (Barbell)", muscle: "Glutes", sets: 4, reps: "10–12", notes: "Best glute exercise. Progressive weight.", met: MET.compoundMedium },
        { id: "vt-3-8", name: "Standing Calf Raise", muscle: "Calves", sets: 4, reps: "15–20", notes: "3-sec negative. Full range.", met: MET.isolation, rec: true },
      ],
    },
    {
      label: "Day 4", name: "UPPER — Thick Back & Rear Delts", focus: "Traps · Rear Delt · Strength",
      color: C.red,
      exercises: [
        { id: "vt-4-1", name: "Conventional Deadlift", muscle: "Back", sets: 4, reps: "4–6", notes: "Max strength day. Full intensity.", met: MET.compoundHeavy, rec: true },
        { id: "vt-4-2", name: "Chest-supported DB Row", muscle: "Lats", sets: 3, reps: "10–12", notes: "Removes lower back from the equation.", met: MET.compoundMedium, rec: true },
        { id: "vt-4-3", name: "Neutral-grip Pulldown", muscle: "Lats", sets: 3, reps: "10–12", notes: "Inner lats and teres major.", met: MET.compoundMedium },
        { id: "vt-4-4", name: "Face Pulls", muscle: "Rear Delt", sets: 4, reps: "15–20", notes: "Essential for V rear view. High rope.", met: MET.isolation, rec: true },
        { id: "vt-4-5", name: "Rear Delt DB Fly", muscle: "Rear Delt", sets: 3, reps: "15–20", notes: "Leaning forward. Elbows slightly bent.", met: MET.isolation, rec: true },
        { id: "vt-4-6", name: "Incline Lateral Raise", muscle: "Shoulders", sets: 3, reps: "12–15", notes: "Pure lateral delt isolation.", met: MET.isolation, rec: true },
        { id: "vt-4-7", name: "DB Shrugs", muscle: "Traps", sets: 3, reps: "12–15", notes: "1-sec hold at top.", met: MET.isolation },
        { id: "vt-4-8", name: "EZ-bar Scott Curl", muscle: "Biceps", sets: 3, reps: "10–12", notes: "No swing possible. Maximum isolation.", met: MET.isolation, rec: true },
      ],
    },
  ],
};

// ── Iron PPL (Male · Intermediate · 6 days) ───────────────────────────────
const IRON_PPL: TrainingProgram = {
  id: "ppl",
  name: "Iron PPL",
  tagline: "Push · Pull · Legs — 6-day strength",
  gender: "male",
  goal: "strength",
  level: "intermediate",
  daysOptions: [6],
  color: C.red,
  days: [
    {
      label: "Day 1", name: "PUSH A — Heavy", focus: "Chest · Shoulders · Triceps",
      color: C.red,
      exercises: [
        { id: "ppl-1-1", name: "Flat Barbell Bench Press", muscle: "Chest", sets: 4, reps: "4–6", notes: "Primary strength lift. Add weight weekly.", met: MET.compoundHeavy, rec: true },
        { id: "ppl-1-2", name: "Standing OHP", muscle: "Shoulders", sets: 3, reps: "6–8", notes: "Secondary compound. Strict form.", met: MET.compoundHeavy, rec: true },
        { id: "ppl-1-3", name: "Incline DB Press", muscle: "Chest", sets: 3, reps: "8–12", notes: "Upper chest. Full range.", met: MET.compoundMedium, rec: true },
        { id: "ppl-1-4", name: "Cable Lateral Raise", muscle: "Shoulders", sets: 3, reps: "12–15", notes: "Constant tension for delt width.", met: MET.isolation },
        { id: "ppl-1-5", name: "Tricep Pushdown (rope)", muscle: "Triceps", sets: 3, reps: "12–15", notes: "Full extension.", met: MET.isolation },
        { id: "ppl-1-6", name: "Overhead Tricep Extension", muscle: "Triceps", sets: 3, reps: "10–12", notes: "Long head emphasis.", met: MET.isolation },
      ],
    },
    {
      label: "Day 2", name: "PULL A — Heavy", focus: "Back · Biceps",
      color: C.cyan,
      exercises: [
        { id: "ppl-2-1", name: "Deadlift", muscle: "Back", sets: 4, reps: "4–6", notes: "Primary pull strength lift.", met: MET.compoundHeavy, rec: true },
        { id: "ppl-2-2", name: "Barbell Row", muscle: "Lats", sets: 3, reps: "6–8", notes: "Overhand. Pull to lower chest.", met: MET.compoundHeavy, rec: true },
        { id: "ppl-2-3", name: "Weighted Pull-ups", muscle: "Lats", sets: 3, reps: "6–10", notes: "Add weight when 10 reps is easy.", met: MET.bodyweight, rec: true },
        { id: "ppl-2-4", name: "Seated Cable Row", muscle: "Lats", sets: 3, reps: "10–12", notes: "Neutral grip. Squeeze shoulder blades.", met: MET.compoundMedium },
        { id: "ppl-2-5", name: "EZ-bar Curl", muscle: "Biceps", sets: 3, reps: "10–12", notes: "Strict. No body swing.", met: MET.isolation },
        { id: "ppl-2-6", name: "Incline DB Curl", muscle: "Biceps", sets: 3, reps: "10–12", notes: "Maximum stretch at bottom.", met: MET.isolation },
      ],
    },
    {
      label: "Day 3", name: "LEGS A — Quad Focus", focus: "Quads · Hamstrings · Calves",
      color: C.green,
      exercises: [
        { id: "ppl-3-1", name: "Back Squat", muscle: "Quads", sets: 4, reps: "4–6", notes: "Primary leg strength lift.", met: MET.compoundHeavy, rec: true },
        { id: "ppl-3-2", name: "Front Squat", muscle: "Quads", sets: 3, reps: "6–8", notes: "More quad activation. Requires mobility.", met: MET.compoundHeavy },
        { id: "ppl-3-3", name: "Leg Press", muscle: "Quads", sets: 3, reps: "10–12", notes: "Volume work after squats.", met: MET.compoundMedium, rec: true },
        { id: "ppl-3-4", name: "Romanian Deadlift", muscle: "Hamstrings", sets: 3, reps: "10–12", notes: "Hip hinge. Full stretch.", met: MET.compoundHeavy, rec: true },
        { id: "ppl-3-5", name: "Leg Curl", muscle: "Hamstrings", sets: 3, reps: "12–15", notes: "Isolation finisher.", met: MET.isolation },
        { id: "ppl-3-6", name: "Calf Raise", muscle: "Calves", sets: 4, reps: "15–20", notes: "Slow eccentric.", met: MET.isolation },
      ],
    },
    {
      label: "Day 4", name: "PUSH B — Hypertrophy", focus: "Chest · Shoulders · Triceps",
      color: C.orange,
      exercises: [
        { id: "ppl-4-1", name: "Incline Barbell Press", muscle: "Chest", sets: 4, reps: "8–12", notes: "Upper chest focus.", met: MET.compoundHeavy, rec: true },
        { id: "ppl-4-2", name: "DB Shoulder Press", muscle: "Shoulders", sets: 3, reps: "10–12", notes: "Greater ROM than barbell.", met: MET.compoundMedium, rec: true },
        { id: "ppl-4-3", name: "Cable Crossover", muscle: "Chest", sets: 3, reps: "12–15", notes: "Strong contraction at center.", met: MET.isolation, rec: true },
        { id: "ppl-4-4", name: "DB Lateral Raise", muscle: "Shoulders", sets: 4, reps: "12–15", notes: "Width. Don't cheat.", met: MET.isolation, rec: true },
        { id: "ppl-4-5", name: "Skull Crushers", muscle: "Triceps", sets: 3, reps: "10–12", notes: "Long head. EZ-bar preferred.", met: MET.isolation },
        { id: "ppl-4-6", name: "Close-grip Bench Press", muscle: "Triceps", sets: 3, reps: "8–10", notes: "Compound tricep movement.", met: MET.compoundMedium },
      ],
    },
    {
      label: "Day 5", name: "PULL B — Hypertrophy", focus: "Back · Biceps · Rear Delt",
      color: C.violet,
      exercises: [
        { id: "ppl-5-1", name: "Pendlay Row", muscle: "Lats", sets: 4, reps: "6–8", notes: "From floor. Explosive. More load.", met: MET.compoundHeavy, rec: true },
        { id: "ppl-5-2", name: "Lat Pulldown (wide)", muscle: "Lats", sets: 3, reps: "10–12", notes: "Pronated wide grip.", met: MET.compoundMedium, rec: true },
        { id: "ppl-5-3", name: "Straight-arm Pulldown", muscle: "Lats", sets: 3, reps: "12–15", notes: "Pure lat isolation.", met: MET.isolation },
        { id: "ppl-5-4", name: "Face Pulls", muscle: "Rear Delt", sets: 4, reps: "15–20", notes: "Shoulder health. Never skip.", met: MET.isolation, rec: true },
        { id: "ppl-5-5", name: "Hammer Curl", muscle: "Biceps", sets: 3, reps: "12–15", notes: "Brachialis thickness.", met: MET.isolation },
        { id: "ppl-5-6", name: "Cable Curl", muscle: "Biceps", sets: 3, reps: "12–15", notes: "Constant tension. Good pump.", met: MET.isolation },
      ],
    },
    {
      label: "Day 6", name: "LEGS B — Posterior Chain", focus: "Hamstrings · Glutes · Calves",
      color: C.teal,
      exercises: [
        { id: "ppl-6-1", name: "Romanian Deadlift", muscle: "Hamstrings", sets: 4, reps: "8–10", notes: "Primary posterior chain lift.", met: MET.compoundHeavy, rec: true },
        { id: "ppl-6-2", name: "Hip Thrust (Barbell)", muscle: "Glutes", sets: 4, reps: "10–12", notes: "Best glute developer.", met: MET.compoundMedium, rec: true },
        { id: "ppl-6-3", name: "Bulgarian Split Squat", muscle: "Quads", sets: 3, reps: "10–12", notes: "Unilateral balance.", met: MET.compoundMedium, rec: true },
        { id: "ppl-6-4", name: "Seated Leg Curl", muscle: "Hamstrings", sets: 3, reps: "12–15", notes: "More tension at stretch than lying.", met: MET.isolation },
        { id: "ppl-6-5", name: "Hip Abduction Machine", muscle: "Glutes", sets: 3, reps: "15–20", notes: "Glute med. Hip width.", met: MET.isolation },
        { id: "ppl-6-6", name: "Seated Calf Raise", muscle: "Calves", sets: 3, reps: "15–20", notes: "Targets soleus.", met: MET.isolation },
      ],
    },
  ],
};

// ── Atlas Protocol (Male · Advanced · 4 days) ─────────────────────────────
const ATLAS: TrainingProgram = {
  id: "atlas",
  name: "Atlas Protocol",
  tagline: "Powerlifting — Squat · Bench · Deadlift",
  gender: "male",
  goal: "strength",
  level: "advanced",
  daysOptions: [4],
  color: C.gold,
  days: [
    {
      label: "Day 1", name: "SQUAT — Heavy", focus: "Quads · Posterior Chain",
      color: C.gold,
      exercises: [
        { id: "at-1-1", name: "Back Squat (Competition)", muscle: "Quads", sets: 5, reps: "3–5", notes: "Main lift. Competition stance.", met: MET.compoundHeavy, rec: true },
        { id: "at-1-2", name: "Pause Squat", muscle: "Quads", sets: 3, reps: "3–4", notes: "2-sec pause at bottom. Builds strength out of hole.", met: MET.compoundHeavy, rec: true },
        { id: "at-1-3", name: "Romanian Deadlift", muscle: "Hamstrings", sets: 3, reps: "6–8", notes: "Accessory for posterior chain.", met: MET.compoundHeavy },
        { id: "at-1-4", name: "Leg Press", muscle: "Quads", sets: 3, reps: "8–10", notes: "Volume work.", met: MET.compoundMedium },
        { id: "at-1-5", name: "Leg Curl", muscle: "Hamstrings", sets: 3, reps: "10–12", notes: "Hamstring isolation.", met: MET.isolation },
        { id: "at-1-6", name: "Ab Wheel Rollout", muscle: "Core", sets: 3, reps: "10–12", notes: "Core stability for squat.", met: MET.isolation, rec: true },
      ],
    },
    {
      label: "Day 2", name: "BENCH — Heavy", focus: "Chest · Triceps · Shoulders",
      color: C.orange,
      exercises: [
        { id: "at-2-1", name: "Flat Barbell Bench Press", muscle: "Chest", sets: 5, reps: "3–5", notes: "Competition grip and arch.", met: MET.compoundHeavy, rec: true },
        { id: "at-2-2", name: "Pause Bench Press", muscle: "Chest", sets: 3, reps: "3–4", notes: "2-sec pause on chest. Off-the-chest strength.", met: MET.compoundHeavy, rec: true },
        { id: "at-2-3", name: "Close-grip Bench", muscle: "Triceps", sets: 3, reps: "6–8", notes: "Tricep lockout strength.", met: MET.compoundMedium },
        { id: "at-2-4", name: "DB Row", muscle: "Lats", sets: 3, reps: "8–10", notes: "Back health and lat engagement.", met: MET.compoundMedium, rec: true },
        { id: "at-2-5", name: "Skull Crushers", muscle: "Triceps", sets: 3, reps: "10–12", notes: "Accessory tricep volume.", met: MET.isolation },
        { id: "at-2-6", name: "Face Pulls", muscle: "Rear Delt", sets: 3, reps: "15–20", notes: "Shoulder health. Mandatory.", met: MET.isolation, rec: true },
      ],
    },
    {
      label: "Day 3", name: "DEADLIFT — Heavy", focus: "Full Posterior Chain",
      color: C.red,
      exercises: [
        { id: "at-3-1", name: "Conventional Deadlift", muscle: "Back", sets: 5, reps: "2–4", notes: "Main lift. Max effort.", met: MET.compoundHeavy, rec: true },
        { id: "at-3-2", name: "Deficit Deadlift", muscle: "Back", sets: 3, reps: "3–5", notes: "2-inch deficit. Builds off-the-floor strength.", met: MET.compoundHeavy, rec: true },
        { id: "at-3-3", name: "Rack Pull", muscle: "Back", sets: 3, reps: "4–6", notes: "Lockout strength. Just above knee.", met: MET.compoundHeavy },
        { id: "at-3-4", name: "Barbell Row", muscle: "Lats", sets: 3, reps: "6–8", notes: "Upper back accessory.", met: MET.compoundHeavy },
        { id: "at-3-5", name: "Leg Curl", muscle: "Hamstrings", sets: 3, reps: "10–12", notes: "Hamstring health.", met: MET.isolation },
        { id: "at-3-6", name: "Plank", muscle: "Core", sets: 3, reps: "60s", notes: "Core bracing practice.", met: MET.isolation, rec: true },
      ],
    },
    {
      label: "Day 4", name: "ACCESSORY — Weak Points", focus: "Volume · Balance · Recovery",
      color: C.violet,
      exercises: [
        { id: "at-4-1", name: "Squat (moderate)", muscle: "Quads", sets: 4, reps: "5–6", notes: "70–75% 1RM. Technique work.", met: MET.compoundHeavy, rec: true },
        { id: "at-4-2", name: "Bench (moderate)", muscle: "Chest", sets: 4, reps: "5–6", notes: "Touch-and-go. Speed work.", met: MET.compoundHeavy, rec: true },
        { id: "at-4-3", name: "Good Mornings", muscle: "Hamstrings", sets: 3, reps: "8–10", notes: "Lower back and hamstring strength.", met: MET.compoundMedium },
        { id: "at-4-4", name: "OHP", muscle: "Shoulders", sets: 3, reps: "8–10", notes: "Shoulder accessory.", met: MET.compoundMedium },
        { id: "at-4-5", name: "Lat Pulldown", muscle: "Lats", sets: 3, reps: "10–12", notes: "Upper back volume.", met: MET.compoundMedium },
        { id: "at-4-6", name: "DB Curl", muscle: "Biceps", sets: 2, reps: "12–15", notes: "Elbow health.", met: MET.isolation },
      ],
    },
  ],
};

// ── Forge Starter (Unisex · Beginner · 3 days) ────────────────────────────
const FORGE_STARTER: TrainingProgram = {
  id: "forge-starter",
  name: "Forge Starter",
  tagline: "Full body · 3 days · Perfect for beginners",
  gender: "unisex",
  goal: "beginner",
  level: "beginner",
  daysOptions: [3],
  color: C.teal,
  days: [
    {
      label: "Day 1", name: "FULL BODY A", focus: "Squat · Press · Row",
      color: C.teal,
      exercises: [
        { id: "fs-1-1", name: "Goblet Squat", muscle: "Quads", sets: 3, reps: "8–12", notes: "Dumbbell at chest. Great for learning squat pattern.", met: MET.compoundMedium, rec: true },
        { id: "fs-1-2", name: "DB Bench Press", muscle: "Chest", sets: 3, reps: "8–12", notes: "Flat bench. Control the weight down.", met: MET.compoundMedium, rec: true },
        { id: "fs-1-3", name: "Seated Cable Row", muscle: "Lats", sets: 3, reps: "10–12", notes: "Neutral grip. Squeeze at end.", met: MET.compoundMedium, rec: true },
        { id: "fs-1-4", name: "DB OHP", muscle: "Shoulders", sets: 3, reps: "10–12", notes: "Seated or standing. Full ROM.", met: MET.compoundMedium, rec: true },
        { id: "fs-1-5", name: "Leg Curl", muscle: "Hamstrings", sets: 3, reps: "12–15", notes: "Machine. Slow and controlled.", met: MET.isolation },
        { id: "fs-1-6", name: "Plank", muscle: "Core", sets: 3, reps: "30–45s", notes: "Brace your abs. Don't hold breath.", met: MET.isolation, rec: true },
      ],
    },
    {
      label: "Day 2", name: "FULL BODY B", focus: "Hinge · Pull · Push",
      color: C.green,
      exercises: [
        { id: "fs-2-1", name: "Romanian Deadlift (DB)", muscle: "Hamstrings", sets: 3, reps: "10–12", notes: "Learn the hip hinge. Light weight first.", met: MET.compoundMedium, rec: true },
        { id: "fs-2-2", name: "Lat Pulldown", muscle: "Lats", sets: 3, reps: "10–12", notes: "Pull to upper chest. Don't lean too far.", met: MET.compoundMedium, rec: true },
        { id: "fs-2-3", name: "Incline DB Press", muscle: "Chest", sets: 3, reps: "10–12", notes: "30–45°. Upper chest and shoulders.", met: MET.compoundMedium, rec: true },
        { id: "fs-2-4", name: "Leg Press", muscle: "Quads", sets: 3, reps: "10–12", notes: "Machine squat pattern. Safe for beginners.", met: MET.compoundMedium, rec: true },
        { id: "fs-2-5", name: "DB Lateral Raise", muscle: "Shoulders", sets: 3, reps: "12–15", notes: "Light weight. Control the movement.", met: MET.isolation },
        { id: "fs-2-6", name: "DB Curl", muscle: "Biceps", sets: 2, reps: "12–15", notes: "Alternate arms. No body swing.", met: MET.isolation },
      ],
    },
    {
      label: "Day 3", name: "FULL BODY C", focus: "Squat · Hinge · Arms",
      color: C.orange,
      exercises: [
        { id: "fs-3-1", name: "Barbell Back Squat", muscle: "Quads", sets: 3, reps: "8–10", notes: "Step up from goblet squat. Low bar, comfortable.", met: MET.compoundHeavy, rec: true },
        { id: "fs-3-2", name: "Conventional Deadlift (light)", muscle: "Back", sets: 3, reps: "8–10", notes: "Learn the pattern. Form > weight.", met: MET.compoundHeavy, rec: true },
        { id: "fs-3-3", name: "DB Row", muscle: "Lats", sets: 3, reps: "10–12", notes: "One arm at a time. Neutral spine.", met: MET.compoundMedium, rec: true },
        { id: "fs-3-4", name: "Push-ups", muscle: "Chest", sets: 3, reps: "10–15", notes: "Bodyweight. Solid foundation.", met: MET.bodyweight },
        { id: "fs-3-5", name: "Hip Thrust (BW or Barbell)", muscle: "Glutes", sets: 3, reps: "12–15", notes: "Back on bench. Drive hips up.", met: MET.compoundMedium, rec: true },
        { id: "fs-3-6", name: "Tricep Pushdown", muscle: "Triceps", sets: 2, reps: "12–15", notes: "Cable machine. Elbows at sides.", met: MET.isolation },
      ],
    },
  ],
};

// ── Peach Protocol (Female · Intermediate · 4 days) ───────────────────────
const PEACH: TrainingProgram = {
  id: "peach",
  name: "Peach Protocol",
  tagline: "Glutes · Lower Body · Curves",
  gender: "female",
  goal: "aesthetic",
  level: "intermediate",
  daysOptions: [4],
  color: C.pink,
  days: [
    {
      label: "Day 1", name: "GLUTE FOCUS A", focus: "Glutes · Hamstrings",
      color: C.pink,
      exercises: [
        { id: "pp-1-1", name: "Hip Thrust (Barbell)", muscle: "Glutes", sets: 4, reps: "10–12", notes: "The best glute exercise. Progressive weekly.", met: MET.compoundMedium, rec: true },
        { id: "pp-1-2", name: "Romanian Deadlift", muscle: "Hamstrings", sets: 3, reps: "10–12", notes: "Full stretch. Controlled negative.", met: MET.compoundHeavy, rec: true },
        { id: "pp-1-3", name: "Bulgarian Split Squat", muscle: "Glutes", sets: 3, reps: "10–12", notes: "Long stride for more glute. Rear foot elevated.", met: MET.compoundMedium, rec: true },
        { id: "pp-1-4", name: "Cable Kickback", muscle: "Glutes", sets: 3, reps: "15–20", notes: "Full extension. Squeeze at top.", met: MET.isolation, rec: true },
        { id: "pp-1-5", name: "Hip Abduction Machine", muscle: "Glutes", sets: 3, reps: "15–20", notes: "Glute med. Hip width and roundness.", met: MET.isolation, rec: true },
        { id: "pp-1-6", name: "Lying Leg Curl", muscle: "Hamstrings", sets: 3, reps: "12–15", notes: "Hamstring isolation. Full ROM.", met: MET.isolation },
      ],
    },
    {
      label: "Day 2", name: "UPPER BODY", focus: "Back · Shoulders · Arms",
      color: C.violet,
      exercises: [
        { id: "pp-2-1", name: "Lat Pulldown", muscle: "Lats", sets: 3, reps: "10–12", notes: "Wide grip. Pull to upper chest.", met: MET.compoundMedium, rec: true },
        { id: "pp-2-2", name: "Seated Cable Row", muscle: "Lats", sets: 3, reps: "10–12", notes: "Neutral grip. Controlled pull.", met: MET.compoundMedium, rec: true },
        { id: "pp-2-3", name: "DB Lateral Raise", muscle: "Shoulders", sets: 4, reps: "12–15", notes: "Shoulder width. No cheating.", met: MET.isolation, rec: true },
        { id: "pp-2-4", name: "DB OHP", muscle: "Shoulders", sets: 3, reps: "10–12", notes: "Seated. Full range.", met: MET.compoundMedium, rec: true },
        { id: "pp-2-5", name: "DB Curl", muscle: "Biceps", sets: 3, reps: "12–15", notes: "Alternate arms. Supinate at top.", met: MET.isolation },
        { id: "pp-2-6", name: "Tricep Rope Pushdown", muscle: "Triceps", sets: 3, reps: "12–15", notes: "Toned arms. Elbows fixed.", met: MET.isolation },
        { id: "pp-2-7", name: "Face Pulls", muscle: "Rear Delt", sets: 3, reps: "15–20", notes: "Shoulder health and posture.", met: MET.isolation, rec: true },
      ],
    },
    {
      label: "Day 3", name: "QUAD & GLUTE", focus: "Quads · Glutes · Calves",
      color: C.teal,
      exercises: [
        { id: "pp-3-1", name: "Back Squat", muscle: "Quads", sets: 4, reps: "8–10", notes: "Full depth. Hip-width stance.", met: MET.compoundHeavy, rec: true },
        { id: "pp-3-2", name: "Leg Press (wide stance)", muscle: "Glutes", sets: 3, reps: "10–12", notes: "Wide and high feet = more glute.", met: MET.compoundMedium, rec: true },
        { id: "pp-3-3", name: "Walking Lunges", muscle: "Glutes", sets: 3, reps: "12/leg", notes: "Long stride. Torso upright.", met: MET.compoundMedium, rec: true },
        { id: "pp-3-4", name: "Leg Extension", muscle: "Quads", sets: 3, reps: "12–15", notes: "Quad isolation finisher.", met: MET.isolation },
        { id: "pp-3-5", name: "Glute Bridge (DB on hips)", muscle: "Glutes", sets: 3, reps: "15–20", notes: "Floor version. Pause at top.", met: MET.compoundMedium },
        { id: "pp-3-6", name: "Standing Calf Raise", muscle: "Calves", sets: 4, reps: "15–20", notes: "Slow eccentric. Full range.", met: MET.isolation, rec: true },
      ],
    },
    {
      label: "Day 4", name: "GLUTE FOCUS B", focus: "Glutes · Hamstrings · Core",
      color: C.pink,
      exercises: [
        { id: "pp-4-1", name: "Sumo Deadlift", muscle: "Glutes", sets: 4, reps: "8–10", notes: "Wide stance activates glutes more.", met: MET.compoundHeavy, rec: true },
        { id: "pp-4-2", name: "Hip Thrust (single leg)", muscle: "Glutes", sets: 3, reps: "12/leg", notes: "Unilateral. More glute activation.", met: MET.compoundMedium, rec: true },
        { id: "pp-4-3", name: "Seated Leg Curl", muscle: "Hamstrings", sets: 3, reps: "12–15", notes: "Stretch-focused hamstring work.", met: MET.isolation, rec: true },
        { id: "pp-4-4", name: "Cable Kickback", muscle: "Glutes", sets: 3, reps: "15/leg", notes: "Constant tension on glute.", met: MET.isolation, rec: true },
        { id: "pp-4-5", name: "Hip Adduction Machine", muscle: "Glutes", sets: 3, reps: "15–20", notes: "Inner thigh + adductor strength.", met: MET.isolation },
        { id: "pp-4-6", name: "Dead Bug", muscle: "Core", sets: 3, reps: "10/side", notes: "Core stability. Slow and controlled.", met: MET.isolation, rec: true },
      ],
    },
  ],
};

// ── Sculpt & Tone (Female · Beginner · 3 days) ────────────────────────────
const SCULPT: TrainingProgram = {
  id: "sculpt",
  name: "Sculpt & Tone",
  tagline: "Full body · Lean muscle · Beginner friendly",
  gender: "female",
  goal: "toning",
  level: "beginner",
  daysOptions: [3],
  color: C.violet,
  days: [
    {
      label: "Day 1", name: "UPPER BODY + CORE", focus: "Back · Shoulders · Arms · Core",
      color: C.violet,
      exercises: [
        { id: "sc-1-1", name: "Lat Pulldown", muscle: "Lats", sets: 3, reps: "12–15", notes: "Pull to chest. Don't lean too far back.", met: MET.compoundMedium, rec: true },
        { id: "sc-1-2", name: "Seated Cable Row", muscle: "Lats", sets: 3, reps: "12–15", notes: "Neutral grip. Squeeze shoulder blades.", met: MET.compoundMedium, rec: true },
        { id: "sc-1-3", name: "DB Lateral Raise", muscle: "Shoulders", sets: 3, reps: "12–15", notes: "Light weight. Perfect form.", met: MET.isolation, rec: true },
        { id: "sc-1-4", name: "DB OHP", muscle: "Shoulders", sets: 3, reps: "10–12", notes: "Seated. Core tight.", met: MET.compoundMedium, rec: true },
        { id: "sc-1-5", name: "DB Curl", muscle: "Biceps", sets: 3, reps: "12–15", notes: "Slow and controlled.", met: MET.isolation },
        { id: "sc-1-6", name: "Tricep Pushdown", muscle: "Triceps", sets: 3, reps: "12–15", notes: "Toned arms. Elbows at sides.", met: MET.isolation },
        { id: "sc-1-7", name: "Plank", muscle: "Core", sets: 3, reps: "30s", notes: "Straight line from head to heels.", met: MET.isolation, rec: true },
      ],
    },
    {
      label: "Day 2", name: "LOWER BODY + GLUTES", focus: "Glutes · Quads · Hamstrings",
      color: C.pink,
      exercises: [
        { id: "sc-2-1", name: "Goblet Squat", muscle: "Quads", sets: 3, reps: "12–15", notes: "DB at chest. Great learning tool.", met: MET.compoundMedium, rec: true },
        { id: "sc-2-2", name: "Hip Thrust (BW)", muscle: "Glutes", sets: 3, reps: "15–20", notes: "Bodyweight to start. Progress to barbell.", met: MET.compoundMedium, rec: true },
        { id: "sc-2-3", name: "Romanian Deadlift (DB)", muscle: "Hamstrings", sets: 3, reps: "12–15", notes: "Hip hinge. Feel the stretch.", met: MET.compoundMedium, rec: true },
        { id: "sc-2-4", name: "Walking Lunge", muscle: "Glutes", sets: 3, reps: "10/leg", notes: "DB in hands. Long step.", met: MET.compoundMedium, rec: true },
        { id: "sc-2-5", name: "Hip Abduction Machine", muscle: "Glutes", sets: 3, reps: "15–20", notes: "Slow. Full range.", met: MET.isolation, rec: true },
        { id: "sc-2-6", name: "Standing Calf Raise", muscle: "Calves", sets: 3, reps: "15–20", notes: "Full range of motion.", met: MET.isolation },
      ],
    },
    {
      label: "Day 3", name: "FULL BODY + CORE", focus: "Compound Movements · Core",
      color: C.teal,
      exercises: [
        { id: "sc-3-1", name: "Leg Press", muscle: "Quads", sets: 3, reps: "12–15", notes: "Safe squatting pattern on machine.", met: MET.compoundMedium, rec: true },
        { id: "sc-3-2", name: "Incline DB Press", muscle: "Chest", sets: 3, reps: "10–12", notes: "Upper chest. Great for posture.", met: MET.compoundMedium, rec: true },
        { id: "sc-3-3", name: "DB Row", muscle: "Lats", sets: 3, reps: "12–15", notes: "One arm. Neutral spine.", met: MET.compoundMedium, rec: true },
        { id: "sc-3-4", name: "Cable Kickback", muscle: "Glutes", sets: 3, reps: "15/leg", notes: "Full extension. Squeeze glute.", met: MET.isolation, rec: true },
        { id: "sc-3-5", name: "Leg Curl", muscle: "Hamstrings", sets: 3, reps: "12–15", notes: "Machine. Controlled.", met: MET.isolation },
        { id: "sc-3-6", name: "Dead Bug", muscle: "Core", sets: 3, reps: "8/side", notes: "Slow. Lower back on floor the whole time.", met: MET.isolation, rec: true },
      ],
    },
  ],
};

// ── Power Femme (Female · Intermediate · 4 days) ──────────────────────────
const POWER_FEMME: TrainingProgram = {
  id: "power-femme",
  name: "Power Femme",
  tagline: "Strength first · Squat · Hip Thrust · RDL",
  gender: "female",
  goal: "strength",
  level: "intermediate",
  daysOptions: [4],
  color: C.crimson,
  days: [
    {
      label: "Day 1", name: "SQUAT — Heavy", focus: "Quads · Glutes",
      color: C.crimson,
      exercises: [
        { id: "pf-1-1", name: "Back Squat", muscle: "Quads", sets: 4, reps: "5–6", notes: "Main lift. Work up to heavy set.", met: MET.compoundHeavy, rec: true },
        { id: "pf-1-2", name: "Pause Squat", muscle: "Quads", sets: 3, reps: "4–5", notes: "2-sec pause. Builds strength at bottom.", met: MET.compoundHeavy, rec: true },
        { id: "pf-1-3", name: "Bulgarian Split Squat", muscle: "Glutes", sets: 3, reps: "8–10", notes: "Unilateral strength.", met: MET.compoundMedium, rec: true },
        { id: "pf-1-4", name: "Leg Extension", muscle: "Quads", sets: 3, reps: "12–15", notes: "Accessory isolation.", met: MET.isolation },
        { id: "pf-1-5", name: "Hip Abduction Machine", muscle: "Glutes", sets: 3, reps: "15–20", notes: "Glute med activation.", met: MET.isolation, rec: true },
        { id: "pf-1-6", name: "Plank", muscle: "Core", sets: 3, reps: "45s", notes: "Core strength for squat stability.", met: MET.isolation, rec: true },
      ],
    },
    {
      label: "Day 2", name: "UPPER BODY", focus: "Back · Shoulders · Arms",
      color: C.violet,
      exercises: [
        { id: "pf-2-1", name: "Weighted Pull-ups", muscle: "Lats", sets: 3, reps: "5–8", notes: "Add weight if bodyweight is easy.", met: MET.bodyweight, rec: true },
        { id: "pf-2-2", name: "Barbell Row", muscle: "Lats", sets: 3, reps: "6–8", notes: "Overhand. Pull to lower chest.", met: MET.compoundHeavy, rec: true },
        { id: "pf-2-3", name: "Standing OHP", muscle: "Shoulders", sets: 3, reps: "6–8", notes: "Strict press. Build shoulder strength.", met: MET.compoundHeavy, rec: true },
        { id: "pf-2-4", name: "DB Lateral Raise", muscle: "Shoulders", sets: 4, reps: "12–15", notes: "Width and definition.", met: MET.isolation, rec: true },
        { id: "pf-2-5", name: "Face Pulls", muscle: "Rear Delt", sets: 3, reps: "15–20", notes: "Shoulder health.", met: MET.isolation, rec: true },
        { id: "pf-2-6", name: "EZ-bar Curl", muscle: "Biceps", sets: 3, reps: "10–12", notes: "Arm strength.", met: MET.isolation },
      ],
    },
    {
      label: "Day 3", name: "HIP THRUST — Heavy", focus: "Glutes · Posterior Chain",
      color: C.pink,
      exercises: [
        { id: "pf-3-1", name: "Hip Thrust (Barbell)", muscle: "Glutes", sets: 5, reps: "6–8", notes: "Main lift. Drive from heels. Chin to chest.", met: MET.compoundMedium, rec: true },
        { id: "pf-3-2", name: "Sumo Deadlift", muscle: "Glutes", sets: 3, reps: "6–8", notes: "Glute-focused deadlift variation.", met: MET.compoundHeavy, rec: true },
        { id: "pf-3-3", name: "Cable Kickback", muscle: "Glutes", sets: 3, reps: "15/leg", notes: "Isolation finisher.", met: MET.isolation, rec: true },
        { id: "pf-3-4", name: "Lying Leg Curl", muscle: "Hamstrings", sets: 3, reps: "12–15", notes: "Hamstring health.", met: MET.isolation },
        { id: "pf-3-5", name: "Hip Adduction Machine", muscle: "Glutes", sets: 3, reps: "15–20", notes: "Inner thigh strength.", met: MET.isolation },
        { id: "pf-3-6", name: "Standing Calf Raise", muscle: "Calves", sets: 3, reps: "15–20", notes: "Lower leg finisher.", met: MET.isolation },
      ],
    },
    {
      label: "Day 4", name: "RDL — Heavy", focus: "Hamstrings · Glutes · Back",
      color: C.orange,
      exercises: [
        { id: "pf-4-1", name: "Romanian Deadlift", muscle: "Hamstrings", sets: 4, reps: "6–8", notes: "Main lift. Feel the stretch.", met: MET.compoundHeavy, rec: true },
        { id: "pf-4-2", name: "Good Mornings", muscle: "Hamstrings", sets: 3, reps: "8–10", notes: "Posterior chain accessory.", met: MET.compoundMedium, rec: true },
        { id: "pf-4-3", name: "Leg Press", muscle: "Quads", sets: 3, reps: "10–12", notes: "Volume work.", met: MET.compoundMedium, rec: true },
        { id: "pf-4-4", name: "Hip Thrust (DB)", muscle: "Glutes", sets: 3, reps: "12–15", notes: "Accessory glute work.", met: MET.compoundMedium },
        { id: "pf-4-5", name: "Seated Leg Curl", muscle: "Hamstrings", sets: 3, reps: "12–15", notes: "Better stretch than lying version.", met: MET.isolation },
        { id: "pf-4-6", name: "Ab Wheel Rollout", muscle: "Core", sets: 3, reps: "8–10", notes: "Core strength for all lifts.", met: MET.isolation, rec: true },
      ],
    },
  ],
};

// ── Venus Split (Female · Intermediate · 5 days) ──────────────────────────
const VENUS: TrainingProgram = {
  id: "venus",
  name: "Venus Split",
  tagline: "Upper/Lower · Aesthetic · 5 days",
  gender: "female",
  goal: "aesthetic",
  level: "intermediate",
  daysOptions: [5],
  color: C.orange,
  days: [
    {
      label: "Day 1", name: "UPPER A — Back & Shoulders", focus: "Lats · Rear Delt · Shoulders",
      color: C.orange,
      exercises: [
        { id: "vn-1-1", name: "Lat Pulldown", muscle: "Lats", sets: 4, reps: "10–12", notes: "Wide pronated grip.", met: MET.compoundMedium, rec: true },
        { id: "vn-1-2", name: "Seated Cable Row", muscle: "Lats", sets: 3, reps: "10–12", notes: "Neutral grip. Pause at end.", met: MET.compoundMedium, rec: true },
        { id: "vn-1-3", name: "DB Lateral Raise", muscle: "Shoulders", sets: 4, reps: "12–15", notes: "Shoulder width.", met: MET.isolation, rec: true },
        { id: "vn-1-4", name: "DB OHP", muscle: "Shoulders", sets: 3, reps: "10–12", notes: "Seated. Full range.", met: MET.compoundMedium, rec: true },
        { id: "vn-1-5", name: "Face Pulls", muscle: "Rear Delt", sets: 3, reps: "15–20", notes: "Shoulder health.", met: MET.isolation, rec: true },
        { id: "vn-1-6", name: "DB Curl", muscle: "Biceps", sets: 3, reps: "12–15", notes: "Alternate. Supinate at top.", met: MET.isolation },
      ],
    },
    {
      label: "Day 2", name: "LOWER A — Glute & Hamstring", focus: "Glutes · Hamstrings",
      color: C.pink,
      exercises: [
        { id: "vn-2-1", name: "Hip Thrust (Barbell)", muscle: "Glutes", sets: 4, reps: "10–12", notes: "Primary glute lift.", met: MET.compoundMedium, rec: true },
        { id: "vn-2-2", name: "Romanian Deadlift", muscle: "Hamstrings", sets: 3, reps: "10–12", notes: "Full hamstring stretch.", met: MET.compoundHeavy, rec: true },
        { id: "vn-2-3", name: "Bulgarian Split Squat", muscle: "Glutes", sets: 3, reps: "10/leg", notes: "Long stride for more glute.", met: MET.compoundMedium, rec: true },
        { id: "vn-2-4", name: "Lying Leg Curl", muscle: "Hamstrings", sets: 3, reps: "12–15", notes: "Isolation.", met: MET.isolation },
        { id: "vn-2-5", name: "Hip Abduction Machine", muscle: "Glutes", sets: 3, reps: "15–20", notes: "Glute med.", met: MET.isolation, rec: true },
        { id: "vn-2-6", name: "Standing Calf Raise", muscle: "Calves", sets: 3, reps: "15–20", notes: "Slow negative.", met: MET.isolation },
      ],
    },
    {
      label: "Day 3", name: "UPPER B — Chest & Triceps", focus: "Chest · Triceps · Shoulders",
      color: C.violet,
      exercises: [
        { id: "vn-3-1", name: "Incline DB Press", muscle: "Chest", sets: 4, reps: "10–12", notes: "Upper chest emphasis.", met: MET.compoundMedium, rec: true },
        { id: "vn-3-2", name: "Cable Crossover", muscle: "Chest", sets: 3, reps: "12–15", notes: "Lower chest contraction.", met: MET.isolation, rec: true },
        { id: "vn-3-3", name: "DB Lateral Raise", muscle: "Shoulders", sets: 3, reps: "12–15", notes: "Shoulder width.", met: MET.isolation, rec: true },
        { id: "vn-3-4", name: "Tricep Rope Pushdown", muscle: "Triceps", sets: 3, reps: "12–15", notes: "Toned arms.", met: MET.isolation, rec: true },
        { id: "vn-3-5", name: "Overhead Tricep Extension", muscle: "Triceps", sets: 3, reps: "12–15", notes: "Long head.", met: MET.isolation },
        { id: "vn-3-6", name: "Hammer Curl", muscle: "Biceps", sets: 3, reps: "12–15", notes: "Brachialis thickness.", met: MET.isolation },
      ],
    },
    {
      label: "Day 4", name: "LOWER B — Quad Focus", focus: "Quads · Glutes",
      color: C.teal,
      exercises: [
        { id: "vn-4-1", name: "Back Squat", muscle: "Quads", sets: 4, reps: "8–10", notes: "Main quad builder.", met: MET.compoundHeavy, rec: true },
        { id: "vn-4-2", name: "Leg Press", muscle: "Quads", sets: 3, reps: "10–12", notes: "Volume after squats.", met: MET.compoundMedium, rec: true },
        { id: "vn-4-3", name: "Walking Lunges", muscle: "Glutes", sets: 3, reps: "12/leg", notes: "Long stride for glutes.", met: MET.compoundMedium, rec: true },
        { id: "vn-4-4", name: "Leg Extension", muscle: "Quads", sets: 3, reps: "12–15", notes: "Quad isolation.", met: MET.isolation },
        { id: "vn-4-5", name: "Hip Thrust (DB)", muscle: "Glutes", sets: 3, reps: "12–15", notes: "Glute finisher.", met: MET.compoundMedium },
        { id: "vn-4-6", name: "Seated Calf Raise", muscle: "Calves", sets: 3, reps: "15–20", notes: "Soleus focus.", met: MET.isolation },
      ],
    },
    {
      label: "Day 5", name: "FULL BODY PUMP", focus: "Full Body · Conditioning",
      color: C.gold,
      exercises: [
        { id: "vn-5-1", name: "DB Row", muscle: "Lats", sets: 3, reps: "12–15", notes: "High volume back work.", met: MET.compoundMedium, rec: true },
        { id: "vn-5-2", name: "DB Bench Press", muscle: "Chest", sets: 3, reps: "12–15", notes: "Chest volume.", met: MET.compoundMedium, rec: true },
        { id: "vn-5-3", name: "Cable Kickback", muscle: "Glutes", sets: 3, reps: "15/leg", notes: "Glute isolation.", met: MET.isolation, rec: true },
        { id: "vn-5-4", name: "DB Lateral Raise", muscle: "Shoulders", sets: 3, reps: "15–20", notes: "Light. High reps pump.", met: MET.isolation, rec: true },
        { id: "vn-5-5", name: "Leg Curl", muscle: "Hamstrings", sets: 3, reps: "12–15", notes: "Hamstring pump.", met: MET.isolation },
        { id: "vn-5-6", name: "EZ-bar Curl", muscle: "Biceps", sets: 3, reps: "12–15", notes: "Arm pump finisher.", met: MET.isolation },
      ],
    },
  ],
};

// ── Minimalist (Unisex · Beginner · 3 days) ───────────────────────────────
const MINIMALIST: TrainingProgram = {
  id: "minimalist",
  name: "Minimalist",
  tagline: "Home or Gym · No equipment needed",
  gender: "unisex",
  goal: "beginner",
  level: "beginner",
  daysOptions: [3],
  color: C.green,
  days: [
    {
      label: "Day 1", name: "PUSH — Upper Body", focus: "Chest · Shoulders · Triceps",
      color: C.green,
      exercises: [
        { id: "mn-1-1", name: "Push-ups", muscle: "Chest", sets: 4, reps: "10–20", notes: "Standard. Add weight vest to progress.", met: MET.bodyweight, rec: true },
        { id: "mn-1-2", name: "Pike Push-ups", muscle: "Shoulders", sets: 3, reps: "10–15", notes: "Hips high. Targets shoulders.", met: MET.bodyweight, rec: true },
        { id: "mn-1-3", name: "Dips (chair/parallel bars)", muscle: "Triceps", sets: 3, reps: "10–15", notes: "Upright torso. Tricep focus.", met: MET.bodyweight, rec: true },
        { id: "mn-1-4", name: "Diamond Push-ups", muscle: "Triceps", sets: 3, reps: "10–15", notes: "Hands close together.", met: MET.bodyweight },
        { id: "mn-1-5", name: "Plank", muscle: "Core", sets: 3, reps: "45s", notes: "Tight everything.", met: MET.isolation, rec: true },
      ],
    },
    {
      label: "Day 2", name: "PULL & LOWER", focus: "Back · Biceps · Legs",
      color: C.cyan,
      exercises: [
        { id: "mn-2-1", name: "Pull-ups / Negative Pull-ups", muscle: "Lats", sets: 3, reps: "5–10", notes: "Jump up, lower slowly if needed.", met: MET.bodyweight, rec: true },
        { id: "mn-2-2", name: "Bodyweight Rows (table)", muscle: "Lats", sets: 3, reps: "10–15", notes: "Feet out, pull chest to table edge.", met: MET.bodyweight, rec: true },
        { id: "mn-2-3", name: "Bodyweight Squat", muscle: "Quads", sets: 3, reps: "20–30", notes: "Full depth. Add jump to progress.", met: MET.bodyweight, rec: true },
        { id: "mn-2-4", name: "Glute Bridge", muscle: "Glutes", sets: 3, reps: "20–25", notes: "Drive hips up. Squeeze at top.", met: MET.bodyweight, rec: true },
        { id: "mn-2-5", name: "Calf Raise (step)", muscle: "Calves", sets: 4, reps: "20–25", notes: "On a step for full range.", met: MET.isolation },
      ],
    },
    {
      label: "Day 3", name: "FULL BODY + CORE", focus: "Compound Movements · Core",
      color: C.orange,
      exercises: [
        { id: "mn-3-1", name: "Bulgarian Split Squat (BW)", muscle: "Quads", sets: 3, reps: "10/leg", notes: "Rear foot on chair.", met: MET.bodyweight, rec: true },
        { id: "mn-3-2", name: "Push-up Variations", muscle: "Chest", sets: 3, reps: "10–15", notes: "Wide / close / incline each set.", met: MET.bodyweight, rec: true },
        { id: "mn-3-3", name: "Inverted Row", muscle: "Lats", sets: 3, reps: "10–15", notes: "Under a bar or table.", met: MET.bodyweight, rec: true },
        { id: "mn-3-4", name: "Hip Thrust (BW)", muscle: "Glutes", sets: 3, reps: "20–25", notes: "Back on couch or bench.", met: MET.bodyweight, rec: true },
        { id: "mn-3-5", name: "Ab Bicycle", muscle: "Core", sets: 3, reps: "20/side", notes: "Controlled. Touch elbow to knee.", met: MET.isolation, rec: true },
        { id: "mn-3-6", name: "Superman Hold", muscle: "Core", sets: 3, reps: "10–12", notes: "Lower back strength.", met: MET.isolation },
      ],
    },
  ],
};

// ── Calisthenics (Unisex · Intermediate · 4 days) ─────────────────────────
const CALISTHENICS: TrainingProgram = {
  id: "calisthenics",
  name: "Calisthenics",
  tagline: "No equipment · Pure bodyweight · Strength & skills",
  gender: "unisex",
  goal: "aesthetic",
  level: "intermediate",
  daysOptions: [4],
  color: C.green,
  days: [
    {
      label: "Day 1", name: "PUSH — Chest & Shoulders", focus: "Chest · Shoulders · Triceps",
      color: C.green,
      exercises: [
        { id: "cl-1-1", name: "Push-ups", muscle: "Chest", sets: 4, reps: "15–20", notes: "Hands shoulder-width. Full range. Elbows at 45°.", met: MET.bodyweight, rec: true },
        { id: "cl-1-2", name: "Wide Push-ups", muscle: "Chest", sets: 3, reps: "12–15", notes: "Hands wider than shoulders. Greater chest stretch.", met: MET.bodyweight, rec: true },
        { id: "cl-1-3", name: "Pike Push-ups", muscle: "Shoulders", sets: 3, reps: "10–12", notes: "Hips high, head toward floor. Mimics shoulder press.", met: MET.bodyweight, rec: true },
        { id: "cl-1-4", name: "Dips", muscle: "Triceps", sets: 3, reps: "10–15", notes: "Parallel bars or chair. Upright torso = tricep focus.", met: MET.bodyweight, rec: true },
        { id: "cl-1-5", name: "Diamond Push-ups", muscle: "Triceps", sets: 3, reps: "10–15", notes: "Hands in diamond shape under chest.", met: MET.bodyweight },
        { id: "cl-1-6", name: "Pseudo Planche Push-ups", muscle: "Chest", sets: 3, reps: "8–12", notes: "Hands at hip level, lean forward. Advanced chest push.", met: MET.bodyweight },
        { id: "cl-1-7", name: "Plank", muscle: "Core", sets: 3, reps: "45–60s", notes: "Straight line head to heels. Brace everything.", met: MET.isolation, rec: true },
      ],
    },
    {
      label: "Day 2", name: "PULL — Back & Biceps", focus: "Lats · Biceps · Scapula",
      color: C.cyan,
      exercises: [
        { id: "cl-2-1", name: "Pull-ups", muscle: "Lats", sets: 4, reps: "5–10", notes: "Overhand grip. Full hang to chin over bar.", met: MET.bodyweight, rec: true },
        { id: "cl-2-2", name: "Chin-ups", muscle: "Biceps", sets: 3, reps: "6–10", notes: "Underhand grip. Stronger bicep activation.", met: MET.bodyweight, rec: true },
        { id: "cl-2-3", name: "Australian Rows", muscle: "Lats", sets: 3, reps: "10–15", notes: "Under a bar at waist height. Pull chest to bar.", met: MET.bodyweight, rec: true },
        { id: "cl-2-4", name: "Negative Pull-ups", muscle: "Lats", sets: 3, reps: "5–8", notes: "Jump to top, lower yourself over 5 seconds.", met: MET.bodyweight, rec: true },
        { id: "cl-2-5", name: "Archer Pull-ups", muscle: "Lats", sets: 3, reps: "4–6/side", notes: "One arm pulls, other arm assists straight. Unilateral prep.", met: MET.bodyweight },
        { id: "cl-2-6", name: "Scapular Pull-ups", muscle: "Lats", sets: 3, reps: "10–12", notes: "Arms straight, only retract and depress scapula. Shoulder health.", met: MET.bodyweight, rec: true },
      ],
    },
    {
      label: "Day 3", name: "LEGS — Squat & Hinge", focus: "Quads · Glutes · Hamstrings",
      color: C.orange,
      exercises: [
        { id: "cl-3-1", name: "Bodyweight Squat", muscle: "Quads", sets: 4, reps: "20–30", notes: "Full depth. Heels down. Chest up.", met: MET.bodyweight, rec: true },
        { id: "cl-3-2", name: "Jump Squats", muscle: "Quads", sets: 3, reps: "15–20", notes: "Explosive. Land soft. Great for power.", met: MET.bodyweight, rec: true },
        { id: "cl-3-3", name: "Pistol Squat Progression", muscle: "Quads", sets: 3, reps: "5–8/leg", notes: "Hold a door frame or rings for assistance. Work toward unassisted.", met: MET.bodyweight, rec: true },
        { id: "cl-3-4", name: "Walking Lunges", muscle: "Glutes", sets: 3, reps: "12/leg", notes: "Long stride. Rear knee just above floor.", met: MET.bodyweight, rec: true },
        { id: "cl-3-5", name: "Nordic Curl Progression", muscle: "Hamstrings", sets: 3, reps: "5–8", notes: "Anchor feet under couch. Lower slowly. Best BW hamstring exercise.", met: MET.bodyweight, rec: true },
        { id: "cl-3-6", name: "Glute Bridge", muscle: "Glutes", sets: 3, reps: "20–25", notes: "Drive hips up. Squeeze at top. Progress to single leg.", met: MET.bodyweight, rec: true },
        { id: "cl-3-7", name: "Calf Raise (step)", muscle: "Calves", sets: 4, reps: "20–25", notes: "On a step edge. Full range. 3-sec negative.", met: MET.isolation },
      ],
    },
    {
      label: "Day 4", name: "CORE & SKILLS", focus: "Core · Balance · Skill work",
      color: C.violet,
      exercises: [
        { id: "cl-4-1", name: "Hollow Body Hold", muscle: "Core", sets: 4, reps: "30–45s", notes: "Lower back pressed to floor. Arms and legs fully extended.", met: MET.isolation, rec: true },
        { id: "cl-4-2", name: "L-sit Progression", muscle: "Core", sets: 3, reps: "10–20s", notes: "On parallel bars or floor. Keep legs straight and parallel to ground.", met: MET.isolation, rec: true },
        { id: "cl-4-3", name: "Hanging Leg Raises", muscle: "Core", sets: 3, reps: "10–15", notes: "Straight legs. No swinging. Slow and controlled.", met: MET.bodyweight, rec: true },
        { id: "cl-4-4", name: "Ab Bicycle", muscle: "Core", sets: 3, reps: "20/side", notes: "Controlled rotation. Elbow to opposite knee.", met: MET.isolation },
        { id: "cl-4-5", name: "Handstand Practice", muscle: "Shoulders", sets: 5, reps: "20–30s", notes: "Wall-assisted. Work toward freestanding. Core and balance.", met: MET.bodyweight, rec: true },
        { id: "cl-4-6", name: "Muscle-up Progression", muscle: "Lats", sets: 3, reps: "3–6", notes: "Explosive pull-up into a dip at the top. King of calisthenics.", met: MET.bodyweight, rec: true },
        { id: "cl-4-7", name: "Superman Hold", muscle: "Core", sets: 3, reps: "10–12", notes: "Lower back strength and spine health.", met: MET.isolation },
      ],
    },
  ],
};

// ── All programs registry ──────────────────────────────────────────────────
export const ALL_PROGRAMS: TrainingProgram[] = [
  VTAPER,
  IRON_PPL,
  ATLAS,
  FORGE_STARTER,
  PEACH,
  SCULPT,
  POWER_FEMME,
  VENUS,
  MINIMALIST,
  CALISTHENICS,
];

// ── Helpers ────────────────────────────────────────────────────────────────
export function getProgramById(id: string): TrainingProgram | undefined {
  return ALL_PROGRAMS.find((p) => p.id === id);
}

// ── Build a UserProgramConfig from a template ──────────────────────────────
export function buildProgramConfig(
  programId: string,
  daysPerWeek: number,
  scheduledWeekDays: number[],
): UserProgramConfig | null {
  const template = getProgramById(programId);
  if (!template) return null;
  const days: UserProgramDay[] = template.days
    .slice(0, daysPerWeek)
    .map((d) => ({
      label: d.label,
      name: d.name,
      focus: d.focus,
      color: d.color,
      exercises: d.exercises
        .filter((e) => e.rec)
        .map((e) => ({
          id: e.id,
          name: e.name,
          muscle: e.muscle,
          sets: e.sets,
          reps: e.reps,
          notes: e.notes,
          met: e.met,
          enabled: true,
        })),
    }));
  return {
    id: crypto.randomUUID(),
    programId,
    programName: template.name,
    daysPerWeek,
    scheduledWeekDays,
    days,
    startedAt: new Date().toISOString().slice(0, 10),
  };
}
