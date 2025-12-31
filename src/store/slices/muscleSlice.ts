import type { StateCreator } from 'zustand';
import type { MuscleGroup } from '@/types';

export interface MuscleSlice {
  muscleGroups: MuscleGroup[];
  addMuscleGroup: (muscleGroup: MuscleGroup) => void;
  updateMuscleGroup: (id: string, updates: Partial<MuscleGroup>) => void;
  removeMuscleGroup: (id: string) => void;
}

export const createMuscleSlice: StateCreator<MuscleSlice, [], [], MuscleSlice> = (set) => ({
  muscleGroups: [],

  addMuscleGroup: (muscleGroup) =>
    set((state) => ({
      muscleGroups: [...state.muscleGroups, muscleGroup],
    })),

  updateMuscleGroup: (id, updates) =>
    set((state) => ({
      muscleGroups: state.muscleGroups.map((mg) =>
        mg.id === id ? { ...mg, ...updates } : mg
      ),
    })),

  removeMuscleGroup: (id) =>
    set((state) => ({
      muscleGroups: state.muscleGroups.filter((mg) => mg.id !== id),
    })),
});
