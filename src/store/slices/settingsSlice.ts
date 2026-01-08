import type { StateCreator } from 'zustand'
import type { UserSettings } from '@/types'

export interface SettingsSlice {
  settings: UserSettings
  isDialogOpen: boolean

  updateSettings: (updates: Partial<UserSettings>) => void
  setDialogOpen: (open: boolean) => void
  toggleDialog: () => void
}

export const createSettingsSlice: StateCreator<
  SettingsSlice,
  [],
  [],
  SettingsSlice
> = (set) => ({
  settings: {
    units: 'metric',
  },
  isDialogOpen: false,

  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),

  setDialogOpen: (open) => set({ isDialogOpen: open }),

  toggleDialog: () => set((state) => ({ isDialogOpen: !state.isDialogOpen })),
})
