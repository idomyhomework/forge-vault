import { useCallback, useEffect } from "react";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../../../utils/storageKeys";
import { ALL_PROGRAMS, getProgramById } from "../gymPrograms";
import { MET } from "../gymCalories";
import type {
  GymUserProfile,
  GymPreferences,
  UserProgramConfig,
  UserProgramDay,
  WorkoutSession,
} from "../gymTypes";

// ── Defaults ───────────────────────────────────────────────────────────────
const DEFAULT_PREFS: GymPreferences = {
  showRestTimer: true,
  restDurationSecs: 90,
};

// ── useGymData hook ────────────────────────────────────────────────────────
export function useGymData() {
  const [profile, setProfile] = useLocalStorage<GymUserProfile | null>(
    STORAGE_KEYS.gymProfile,
    null,
  );
  const [prefs, setPrefs] = useLocalStorage<GymPreferences>(
    STORAGE_KEYS.gymPrefs,
    DEFAULT_PREFS,
  );
  const [programs, setPrograms] = useLocalStorage<UserProgramConfig[]>(
    STORAGE_KEYS.gymPrograms,
    [],
  );
  const [activeId, setActiveId] = useLocalStorage<string | null>(
    STORAGE_KEYS.gymActiveId,
    null,
  );
  const [sessions, setSessions] = useLocalStorage<WorkoutSession[]>(
    STORAGE_KEYS.gymSessions,
    [],
  );

  // ── One-time bodyweight migration ────────────────────────────────────────
  // Existing sessions stored weightKg=0 for bodyweight exercises. This
  // migration sets them to the user's actual body weight so graphs are correct.
  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEYS.gymMigrationV1);
    if (done) return;

    const bw = profile?.bodyWeightKg ?? 70;

    // Build a flat lookup: exerciseId → met value, from all built-in programs
    const metByExId = new Map<string, number>();
    for (const prog of ALL_PROGRAMS) {
      for (const day of prog.days) {
        for (const ex of day.exercises) {
          metByExId.set(ex.id, ex.met);
        }
      }
    }

    setSessions((prev) =>
      prev.map((session) => ({
        ...session,
        exercises: session.exercises.map((ex) => {
          const met = metByExId.get(ex.exerciseId);
          if (met !== MET.bodyweight) return ex;
          return {
            ...ex,
            sets: ex.sets.map((set) =>
              set.weightKg === 0 ? { ...set, weightKg: bw } : set,
            ),
          };
        }),
      })),
    );

    localStorage.setItem(STORAGE_KEYS.gymMigrationV1, "1");
  // Intentionally run once on mount only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived state ────────────────────────────────────────────────────────
  const activeProgram = programs.find((p) => p.id === activeId) ?? null;

  // ── Profile actions ──────────────────────────────────────────────────────
  const saveProfile = useCallback(
    (p: GymUserProfile) => setProfile(p),
    [setProfile],
  );

  // ── Program actions ──────────────────────────────────────────────────────
  const addProgram = useCallback(
    (config: UserProgramConfig) => {
      setPrograms((prev) => [...prev, config]);
      setActiveId(config.id);
    },
    [setPrograms, setActiveId],
  );

  const switchToProgram = useCallback(
    (configId: string) => setActiveId(configId),
    [setActiveId],
  );

  const deleteProgram = useCallback(
    (configId: string) => {
      setPrograms((prev) => {
        const remaining = prev.filter((p) => p.id !== configId);
        setActiveId((cur) => {
          if (cur !== configId) return cur;
          return remaining.length > 0 ? remaining[remaining.length - 1].id : null;
        });
        return remaining;
      });
      setSessions((prev) => prev.filter((s) => s.configId !== configId));
    },
    [setPrograms, setSessions, setActiveId],
  );

  const updateProgram = useCallback(
    (configId: string, days: UserProgramDay[]) => {
      setPrograms((prev) =>
        prev.map((p) => (p.id === configId ? { ...p, days } : p)),
      );
    },
    [setPrograms],
  );

  const touchProgram = useCallback(
    (configId: string, date: string) => {
      setPrograms((prev) =>
        prev.map((p) =>
          p.id === configId ? { ...p, lastTrainedAt: date } : p,
        ),
      );
    },
    [setPrograms],
  );

  // ── Session actions ──────────────────────────────────────────────────────
  const addSession = useCallback(
    (session: WorkoutSession) => {
      setSessions((prev) => [...prev, session]);
      touchProgram(session.configId, session.date);
    },
    [setSessions, touchProgram],
  );

  const getSessionsForProgram = useCallback(
    (configId: string) => sessions.filter((s) => s.configId === configId),
    [sessions],
  );

  const getLastIncompleteSession = useCallback(
    (configId: string): WorkoutSession | null => {
      const today = new Date().toISOString().slice(0, 10);
      return (
        sessions.find(
          (s) => s.configId === configId && s.isPartial && s.date !== today,
        ) ?? null
      );
    },
    [sessions],
  );

  // ── Build a fresh UserProgramConfig from a template ───────────────────
  const buildConfig = useCallback(
    (
      programId: string,
      daysPerWeek: number,
      scheduledWeekDays: number[],
    ): UserProgramConfig | null => {
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
    },
    [],
  );

  return {
    profile,
    prefs,
    programs,
    activeId,
    activeProgram,
    sessions,
    saveProfile,
    setPrefs,
    addProgram,
    switchToProgram,
    updateProgram,
    deleteProgram,
    addSession,
    getSessionsForProgram,
    getLastIncompleteSession,
    buildConfig,
  };
}
