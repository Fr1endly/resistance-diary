import type { StateCreator } from 'zustand'
import type { CompletedSet, WorkoutSession } from '@/types'

export interface SessionSlice {
  sessions: Array<WorkoutSession>
  completedSets: Array<CompletedSet>
  activeSessionId: string | null
  currentDayIndex: number
  currentSetIndex: number
  isWorkoutInProgress: boolean

  // Session actions
  startSession: (session: Omit<WorkoutSession, 'startedAt'>) => void
  completeSession: (notes?: string) => void
  cancelSession: () => void

  // Set actions
  addCompletedSet: (completedSet: CompletedSet) => void
  updateCompletedSet: (id: string, updates: Partial<CompletedSet>) => void
  removeCompletedSet: (id: string) => void

  // Import/Export
  importCompletedSets: (
    sets: Array<CompletedSet>,
    mode: 'replace' | 'merge',
  ) => void

  // Navigation
  setCurrentDayIndex: (index: number) => void
  setCurrentSetIndex: (index: number) => void
  nextSet: () => void
  previousSet: () => void
}

export const createSessionSlice: StateCreator<
  SessionSlice,
  [],
  [],
  SessionSlice
> = (set, get) => ({
  sessions: [],
  completedSets: [],
  activeSessionId: null,
  currentDayIndex: 0,
  currentSetIndex: 0,
  isWorkoutInProgress: false,

  startSession: (sessionData) => {
    get()
    const session: WorkoutSession = {
      ...sessionData,
      startedAt: new Date(),
    }
    set((state) => ({
      sessions: [...state.sessions, session],
      activeSessionId: session.id,
      isWorkoutInProgress: true,
      currentSetIndex: 0,
    }))
  },

  completeSession: (notes) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === state.activeSessionId
          ? { ...s, completedAt: new Date(), notes: notes ?? s.notes }
          : s,
      ),
      activeSessionId: null,
      isWorkoutInProgress: false,
      currentSetIndex: 0,
    })),

  cancelSession: () =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== state.activeSessionId),
      completedSets: state.completedSets.filter(
        (cs) => cs.sessionId !== state.activeSessionId,
      ),
      activeSessionId: null,
      isWorkoutInProgress: false,
      currentSetIndex: 0,
    })),

  addCompletedSet: (completedSet) =>
    set((state) => ({
      completedSets: [...state.completedSets, completedSet],
    })),

  updateCompletedSet: (id, updates) =>
    set((state) => ({
      completedSets: state.completedSets.map((cs) =>
        cs.id === id ? { ...cs, ...updates } : cs,
      ),
    })),

  removeCompletedSet: (id) =>
    set((state) => ({
      completedSets: state.completedSets.filter((cs) => cs.id !== id),
    })),

  importCompletedSets: (sets, mode) =>
    set((state) => {
      if (mode === 'replace') {
        return { completedSets: sets }
      }
      // Merge mode: add only sets with new IDs
      const existingIds = new Set(state.completedSets.map((cs) => cs.id))
      const newSets = sets.filter((s) => !existingIds.has(s.id))
      return { completedSets: [...state.completedSets, ...newSets] }
    }),

  setCurrentDayIndex: (index) => set({ currentDayIndex: index }),

  setCurrentSetIndex: (index) => set({ currentSetIndex: index }),

  nextSet: () =>
    set((state) => ({ currentSetIndex: state.currentSetIndex + 1 })),

  previousSet: () =>
    set((state) => ({
      currentSetIndex: Math.max(0, state.currentSetIndex - 1),
    })),
})
