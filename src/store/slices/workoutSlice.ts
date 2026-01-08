import type { StateCreator } from 'zustand';
import type { WorkoutRoutine, WorkoutDay, PlannedSet } from '@/types';

export interface WorkoutSlice {
  routines: WorkoutRoutine[];
  activeRoutineId: string | null;
  addRoutine: (routine: WorkoutRoutine) => void;
  updateRoutine: (id: string, updates: Partial<WorkoutRoutine>) => void;
  removeRoutine: (id: string) => void;
  setActiveRoutine: (routineId: string | null) => void;
  addDayToRoutine: (routineId: string, day: WorkoutDay) => void;
  updateDay: (routineId: string, dayId: string, updates: Partial<WorkoutDay>) => void;
  removeDayFromRoutine: (routineId: string, dayId: string) => void;
  addPlannedSetToDay: (routineId: string, dayId: string, plannedSet: PlannedSet) => void;
  removePlannedSetFromDay: (routineId: string, dayId: string, setId: string) => void;
  reorderPlannedSets: (routineId: string, dayId: string, orderedSetIds: string[]) => void;
}

export const createWorkoutSlice: StateCreator<WorkoutSlice, [], [], WorkoutSlice> = (set) => ({
  routines: [],
  activeRoutineId: null,

  addRoutine: (routine) =>
    set((state) => ({
      routines: [...state.routines, routine],
    })),

  updateRoutine: (id, updates) =>
    set((state) => ({
      routines: state.routines.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
      ),
    })),

  removeRoutine: (id) =>
    set((state) => ({
      routines: state.routines.filter((r) => r.id !== id),
    })),

  setActiveRoutine: (routineId) => set({ activeRoutineId: routineId }),

  addDayToRoutine: (routineId, day) =>
    set((state) => ({
      routines: state.routines.map((r) =>
        r.id === routineId
          ? { ...r, days: [...r.days, day], updatedAt: new Date() }
          : r
      ),
    })),

  updateDay: (routineId, dayId, updates) =>
    set((state) => ({
      routines: state.routines.map((r) =>
        r.id === routineId
          ? {
              ...r,
              days: r.days.map((d) => (d.id === dayId ? { ...d, ...updates } : d)),
              updatedAt: new Date(),
            }
          : r
      ),
    })),

  removeDayFromRoutine: (routineId, dayId) =>
    set((state) => ({
      routines: state.routines.map((r) =>
        r.id === routineId
          ? { ...r, days: r.days.filter((d) => d.id !== dayId), updatedAt: new Date() }
          : r
      ),
    })),

  addPlannedSetToDay: (routineId, dayId, plannedSet) =>
    set((state) => ({
      routines: state.routines.map((r) =>
        r.id === routineId
          ? {
              ...r,
              days: r.days.map((d) =>
                d.id === dayId
                  ? { ...d, plannedSets: [...d.plannedSets, plannedSet] }
                  : d
              ),
              updatedAt: new Date(),
            }
          : r
      ),
    })),

  removePlannedSetFromDay: (routineId, dayId, setId) =>
    set((state) => ({
      routines: state.routines.map((r) =>
        r.id === routineId
          ? {
              ...r,
              days: r.days.map((d) =>
                d.id === dayId
                  ? { ...d, plannedSets: d.plannedSets.filter((s) => s.id !== setId) }
                  : d
              ),
              updatedAt: new Date(),
            }
          : r
      ),
    })),

  reorderPlannedSets: (routineId, dayId, orderedSetIds) =>
    set((state) => ({
      routines: state.routines.map((r) =>
        r.id === routineId
          ? {
              ...r,
              days: r.days.map((d): WorkoutDay => {
                if (d.id !== dayId) return d;
                const setMap = new Map(d.plannedSets.map((s) => [s.id, s]));
                const reorderedSets: PlannedSet[] = [];
                for (let idx = 0; idx < orderedSetIds.length; idx++) {
                  const set = setMap.get(orderedSetIds[idx]);
                  if (set) {
                    reorderedSets.push({ ...set, order: idx });
                  }
                }
                return { ...d, plannedSets: reorderedSets };
              }),
              updatedAt: new Date(),
            }
          : r
      ),
    })),
});
