import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    createMuscleSlice,
    createExerciseSlice,
    createWorkoutSlice,
    createSessionSlice,
    createSettingsSlice,
    type MuscleSlice,
    type ExerciseSlice,
    type WorkoutSlice,
    type SessionSlice,
    type SettingsSlice,
} from './slices';

// Combined store type
export type AppStore = MuscleSlice &
    ExerciseSlice &
    WorkoutSlice &
    SessionSlice &
    SettingsSlice;

// Custom serialization/deserialization functions
const dateReviver = (_key: string, value: any): any => {
    // Check if the value is a string that looks like an ISO date
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(value)) {
        return new Date(value)
    }
    return value
}

const dateReplacer = (_key: string, value: any): any => {
    // Convert Date objects to ISO strings
    if (value instanceof Date) {
        return value.toISOString()
    }
    return value
}


export const useAppStore = create<AppStore>()(
    persist(
        (...args) => ({
            ...createMuscleSlice(...args),
            ...createExerciseSlice(...args),
            ...createWorkoutSlice(...args),
            ...createSessionSlice(...args),
            ...createSettingsSlice(...args),
        }),
        {
            name: 'resistance-diary-storage',
            storage: createJSONStorage(() => localStorage, {
                replacer: dateReplacer,
                reviver: dateReviver
            }),
            partialize: (state) => ({
                // Persist data
                muscleGroups: state.muscleGroups,
                exercises: state.exercises,
                routines: state.routines,
                sessions: state.sessions,
                completedSets: state.completedSets,
                settings: state.settings,
                activeRoutineId: state.activeRoutineId,
                // Persist active session state for recovery
                activeSessionId: state.activeSessionId,
                currentDayIndex: state.currentDayIndex,
                currentSetIndex: state.currentSetIndex,
                isWorkoutInProgress: state.isWorkoutInProgress,
            }),
        }
    )
);
