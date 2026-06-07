import { useState } from "react";
import { useGymData } from "./gym/hooks/useGymData";
import ProgramSelector from "./gym/components/ProgramSelector";
import ProgramView from "./gym/components/ProgramView";
import ProgramBuilder from "./gym/components/ProgramBuilder";
import WorkoutSession from "./gym/components/WorkoutSession";
import PastPrograms from "./gym/components/PastPrograms";
import HiitView from "./gym/components/HiitView";
import type {
  WorkoutSession as WSession,
  GymUserProfile,
  UserProgramConfig,
} from "./gym/gymTypes";

// -- Tab config --
const GYM_TABS = [
  { id: "workout", label: "Workout" },
  { id: "progress", label: "Progress" },
  { id: "customize", label: "Customize" },
  { id: "hiit", label: "HIIT" },
] as const;
type GymTab = (typeof GYM_TABS)[number]["id"];

// -- Gym component --
export default function Gym() {
  const {
    profile,
    prefs,
    programs,
    activeId,
    activeProgram,
    sessions,
    saveProfile,
    addProgram,
    switchToProgram,
    updateProgram,
    deleteProgram,
    addSession,
    getSessionsForProgram,
    getLastIncompleteSession,
  } = useGymData();

  const [tab, setTab] = useState<GymTab>("workout");
  const [activeWorkout, setActiveWorkout] = useState<{
    dayIndex: number;
  } | null>(null);
  const [dismissedIncomplete, setDismissedIncomplete] = useState(false);
  const [showNewProgramSelector, setShowNewProgramSelector] = useState(false);

  const activeSessions = activeProgram
    ? getSessionsForProgram(activeProgram.id)
    : [];
  const incompleteSession =
    activeProgram && !dismissedIncomplete
      ? getLastIncompleteSession(activeProgram.id)
      : null;

  // ── Workout handlers ─────────────────────────────────────────────────────
  const handleSessionEnd = (session: WSession) => {
    addSession(session);
    setActiveWorkout(null);
    setTab("workout");
  };

  const handleDiscard = () => {
    setActiveWorkout(null);
    setTab("workout");
  };

  // -- Full-screen active workout --
  if (activeWorkout && activeProgram && profile) {
    return (
      <WorkoutSession
        config={activeProgram}
        dayIndex={activeWorkout.dayIndex}
        prefs={prefs}
        bodyWeightKg={profile.bodyWeightKg}
        onFinish={handleSessionEnd}
        onDiscard={handleDiscard}
      />
    );
  }

  // -- Add new program flow --
  if (showNewProgramSelector) {
    return (
      <ProgramSelector
        onComplete={(p: GymUserProfile, config: UserProgramConfig) => {
          saveProfile(p);
          addProgram(config);
          setShowNewProgramSelector(false);
        }}
      />
    );
  }

  // -- Onboarding: first launch --
  if (!profile || programs.length === 0) {
    return (
      <ProgramSelector
        onComplete={(p: GymUserProfile, config: UserProgramConfig) => {
          saveProfile(p);
          addProgram(config);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-6 text-fore">
      {/* -- Tab bar -- */}
      <div className="flex gap-0.5 bg-card rounded-2xl border border-line p-1 overflow-x-auto">
        {GYM_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 rounded-xl font-mono text-[10px] uppercase tracking-widest whitespace-nowrap transition-all active:scale-95"
            style={{
              background: tab === t.id ? "rgba(255,255,255,0.06)" : undefined,
              color: tab === t.id ? "#e8e8ee" : "#8b8b9a",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* -- Workout tab -- */}
      {tab === "workout" &&
        (activeProgram ? (
          <ProgramView
            config={activeProgram}
            sessions={activeSessions}
            incompleteSession={incompleteSession}
            onStartWorkout={(dayIndex) => setActiveWorkout({ dayIndex })}
            onDismissIncomplete={() => setDismissedIncomplete(true)}
          />
        ) : (
          <div className="text-center py-16 text-muted">
            <div className="text-4xl mb-3">🏋️</div>
            <p className="font-sans text-sm mb-4">
              No active program. Go to Progress to switch.
            </p>
            <button
              onClick={() => setTab("progress")}
              className="px-6 py-2.5 rounded-xl font-display text-base tracking-widest text-surface bg-acid active:scale-95"
            >
              View Progress
            </button>
          </div>
        ))}

      {/* -- Customize tab -- */}
      {tab === "customize" &&
        (activeProgram ? (
          <ProgramBuilder
            config={activeProgram}
            onSave={(days) => updateProgram(activeProgram.id, days)}
          />
        ) : (
          <div className="text-center py-16 text-muted">
            <p className="font-sans text-sm">No active program to customize.</p>
          </div>
        ))}

      {/* -- Progress tab (program history + per-day charts) -- */}
      {tab === "progress" && (
        <div className="flex flex-col gap-4">
          <PastPrograms
            programs={programs}
            activeId={activeId}
            sessions={sessions}
            onSwitch={switchToProgram}
            onDelete={deleteProgram}
          />
          <button
            onClick={() => setShowNewProgramSelector(true)}
            className="w-full py-3 rounded-xl font-mono text-[11px] uppercase tracking-widest text-muted border border-line hover:text-fore transition-colors active:scale-95"
          >
            + Add New Program
          </button>
        </div>
      )}

      {/* -- HIIT tab -- */}
      {tab === "hiit" && <HiitView />}
    </div>
  );
}

