import type { StateCreator } from 'zustand'
import type { Exercise } from '@/types'
import { DEFAULT_EXERCISES } from '@/lib/defaultData'

export interface ExerciseSlice {
  exercises: Array<Exercise>
  addExercise: (exercise: Exercise) => void
  updateExercise: (id: string, updates: Partial<Exercise>) => void
  removeExercise: (id: string) => void
}

export const createExerciseSlice: StateCreator<
  ExerciseSlice,
  [],
  [],
  ExerciseSlice
> = (set) => ({
  exercises: DEFAULT_EXERCISES,

  addExercise: (exercise) =>
    set((state) => ({
      exercises: [...state.exercises, exercise],
    })),

  updateExercise: (id, updates) =>
    set((state) => ({
      exercises: state.exercises.map((ex) =>
        ex.id === id ? { ...ex, ...updates } : ex,
      ),
    })),

  removeExercise: (id) =>
    set((state) => ({
      exercises: state.exercises.filter((ex) => ex.id !== id),
    })),
})
