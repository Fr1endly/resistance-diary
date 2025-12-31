import type { StateCreator } from 'zustand';
import type { Exercise } from '@/types';

export interface ExerciseSlice {
  exercises: Exercise[];
  addExercise: (exercise: Exercise) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  removeExercise: (id: string) => void;
}

export const createExerciseSlice: StateCreator<ExerciseSlice, [], [], ExerciseSlice> = (set) => ({
  exercises: [],

  addExercise: (exercise) =>
    set((state) => ({
      exercises: [...state.exercises, exercise],
    })),

  updateExercise: (id, updates) =>
    set((state) => ({
      exercises: state.exercises.map((ex) =>
        ex.id === id ? { ...ex, ...updates } : ex
      ),
    })),

  removeExercise: (id) =>
    set((state) => ({
      exercises: state.exercises.filter((ex) => ex.id !== id),
    })),
});
