import { useState } from "react";
import { ALL_PROGRAMS, buildProgramConfig } from "../gymPrograms";
import type { Gender, GymUserProfile, UserProgramConfig } from "../gymTypes";
import ProgramCard from "./ProgramCard";

// ── Week day names ─────────────────────────────────────────────────────────
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ── ProgramSelector component ──────────────────────────────────────────────
export default function ProgramSelector({
  onComplete,
}: {
  onComplete: (profile: GymUserProfile, config: UserProgramConfig) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [gender, setGender] = useState<Gender>("male");
  const [bodyWeight, setBodyWeight] = useState("75");
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null,
  );
  const [scheduledDays, setScheduledDays] = useState<number[]>([0, 2, 4]);

  // ── Filtered programs ───
  const filtered = ALL_PROGRAMS.filter(
    (p) => p.gender === gender || p.gender === "unisex",
  );
  const selected = ALL_PROGRAMS.find((p) => p.id === selectedProgramId) ?? null;

  // ── Handlers ───
  const toggleDay = (idx: number) => {
    setScheduledDays((prev) =>
      prev.includes(idx)
        ? prev.length > 1
          ? prev.filter((d) => d !== idx)
          : prev
        : [...prev, idx].sort(),
    );
  };

  const handleFinish = () => {
    if (!selected) return;
    const daysPerWeek = Math.min(scheduledDays.length, selected.daysOptions[0]);
    const config = buildProgramConfig(
      selected.id,
      daysPerWeek,
      scheduledDays.slice(0, daysPerWeek),
    );
    if (!config) return;
    onComplete(
      {
        gender,
        bodyWeightKg: Math.max(30, Math.min(300, parseFloat(bodyWeight) || 75)),
      },
      config,
    );
  };

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* ── Header ─── */}
      <div className="bg-card rounded-2xl border border-line px-4 py-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-0.5">
          Setup
        </p>
        <h2 className="font-display text-2xl tracking-wide text-fore leading-none">
          Choose Your Program
        </h2>
        <p className="font-sans text-[11px] text-muted mt-1">
          Step {step} of 3 —{" "}
          {step === 1
            ? "Your profile"
            : step === 2
              ? "Pick a program"
              : "Schedule training days"}
        </p>
      </div>

      {/* ── Step indicator ── */}
      <div className="flex gap-1.5">
        {([1, 2, 3] as const).map((s) => (
          <div
            key={s}
            className="flex-1 h-1 rounded-full transition-all"
            style={{ background: step >= s ? "#d4ff3f" : "#2a2a35" }}
          />
        ))}
      </div>

      {/* ── Step 1: Profile ── */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            I am
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(["male", "female"] as Gender[]).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className="py-4 rounded-2xl border font-display text-xl tracking-wide transition-all active:scale-95"
                style={{
                  background: gender === g ? "#d4ff3f14" : "#16161c",
                  borderColor: gender === g ? "#d4ff3f88" : "#2a2a35",
                  color: gender === g ? "#d4ff3f" : "#8b8b9a",
                }}
              >
                {g === "male" ? "♂ Male" : "♀ Female"}
              </button>
            ))}
          </div>

          <div className="bg-card rounded-2xl border border-line p-4">
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-2">
              Body weight (kg)
            </label>
            <input
              type="number"
              value={bodyWeight}
              onChange={(e) => setBodyWeight(e.target.value)}
              min="30"
              max="250"
              className="w-full bg-card2 rounded-xl border border-line px-4 py-3 font-sans text-base text-fore outline-none focus:border-acid/60 transition-colors"
              placeholder="75"
            />
            <p className="font-sans text-[10px] text-muted mt-1.5">
              Used to estimate calories burned during workouts.
            </p>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-3.5 rounded-xl font-display text-lg tracking-widest text-surface bg-acid active:scale-95 transition-all"
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Step 2: Pick program ─── */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            {filtered.length} programs for you
          </p>
          <div className="flex flex-col gap-2">
            {filtered.map((p) => (
              <ProgramCard
                key={p.id}
                program={p}
                selected={selectedProgramId === p.id}
                onSelect={() => setSelectedProgramId(p.id)}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-xl font-display text-base tracking-widest text-muted bg-card border border-line active:scale-95 transition-all"
            >
              ← Back
            </button>
            <button
              disabled={!selectedProgramId}
              onClick={() => setStep(3)}
              className="flex-1 py-3 rounded-xl font-display text-base tracking-widest text-surface transition-all active:scale-95 disabled:opacity-30"
              style={{ background: selectedProgramId ? "#d4ff3f" : "#2a2a35" }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Schedule days ─── */}
      {step === 3 && selected && (
        <div className="flex flex-col gap-4">
          <div
            className="rounded-2xl border px-4 py-3"
            style={{
              background: selected.color + "14",
              borderColor: selected.color + "33",
            }}
          >
            <p
              className="font-display text-lg tracking-wide leading-none"
              style={{ color: selected.color }}
            >
              {selected.name}
            </p>
            <p className="font-sans text-[11px] text-muted mt-1">
              {selected.tagline} · {selected.daysOptions[0]} days/week
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">
              Train on these days ({scheduledDays.length} selected)
            </p>
            <div className="grid grid-cols-7 gap-1">
              {WEEK_DAYS.map((d, i) => {
                const on = scheduledDays.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggleDay(i)}
                    className="py-3 rounded-xl border font-mono text-[11px] uppercase tracking-wide transition-all active:scale-95"
                    style={{
                      background: on ? selected.color + "20" : "#16161c",
                      borderColor: on ? selected.color + "88" : "#2a2a35",
                      color: on ? selected.color : "#8b8b9a",
                    }}
                  >
                    {d[0]}
                  </button>
                );
              })}
            </div>
            <p className="font-sans text-[10px] text-muted mt-2">
              Tap to toggle. You can change this later.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 rounded-xl font-display text-base tracking-widest text-muted bg-card border border-line active:scale-95 transition-all"
            >
              ← Back
            </button>
            <button
              onClick={handleFinish}
              className="flex-1 py-3 rounded-xl font-display text-base tracking-widest text-surface bg-acid transition-all active:scale-95"
            >
              Start Training
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
