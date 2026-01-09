import type { StateCreator } from 'zustand'
import type { MuscleGroup } from '@/types'
import { DEFAULT_MUSCLE_GROUPS } from '@/lib/defaultData'

export interface MuscleSlice {
  muscleGroups: Array<MuscleGroup>
  addMuscleGroup: (muscleGroup: MuscleGroup) => void
  updateMuscleGroup: (id: string, updates: Partial<MuscleGroup>) => void
  removeMuscleGroup: (id: string) => void
}

export const createMuscleSlice: StateCreator<
  MuscleSlice,
  [],
  [],
  MuscleSlice
> = (set) => ({
  muscleGroups: DEFAULT_MUSCLE_GROUPS,

  addMuscleGroup: (muscleGroup) =>
    set((state) => ({
      muscleGroups: [...state.muscleGroups, muscleGroup],
    })),

  updateMuscleGroup: (id, updates) =>
    set((state) => ({
      muscleGroups: state.muscleGroups.map((mg) =>
        mg.id === id ? { ...mg, ...updates } : mg,
      ),
    })),

  removeMuscleGroup: (id) =>
    set((state) => ({
      muscleGroups: state.muscleGroups.filter((mg) => mg.id !== id),
    })),
})
