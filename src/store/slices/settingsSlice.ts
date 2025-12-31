import type { StateCreator } from 'zustand';
import type { UserSettings } from '@/types';

export interface SettingsSlice {
  settings: UserSettings;
  activeRoutineId: string | null;
  isDialogOpen: boolean;

  updateSettings: (updates: Partial<UserSettings>) => void;
  setActiveRoutine: (routineId: string | null) => void;
  setDialogOpen: (open: boolean) => void;
  toggleDialog: () => void;
}

export const createSettingsSlice: StateCreator<SettingsSlice, [], [], SettingsSlice> = (set) => ({
  settings: {
    units: 'metric',
  },
  activeRoutineId: null,
  isDialogOpen: false,

  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),

  setActiveRoutine: (routineId) => set({ activeRoutineId: routineId }),

  setDialogOpen: (open) => set({ isDialogOpen: open }),

  toggleDialog: () => set((state) => ({ isDialogOpen: !state.isDialogOpen })),
});
