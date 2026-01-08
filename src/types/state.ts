import type { Exercise, MuscleGroup } from './exercise'
import type { WorkoutRoutine } from './workout'
import type { CompletedSet, WorkoutSession } from './session'

export interface UserSettings {
  units: 'metric' | 'imperial'
  name?: string
  email?: string
}

/**
 * Application state shape - reflects the combined Zustand store slices
 */
export interface AppState {
  // MuscleSlice
  muscleGroups: Array<MuscleGroup>

  // ExerciseSlice
  exercises: Array<Exercise>

  // WorkoutSlice
  routines: Array<WorkoutRoutine>

  // SessionSlice
  sessions: Array<WorkoutSession>
  completedSets: Array<CompletedSet>
  activeSessionId: string | null
  currentDayIndex: number
  currentSetIndex: number
  isWorkoutInProgress: boolean

  // SettingsSlice
  settings: UserSettings
  activeRoutineId: string | null
  isDialogOpen: boolean

  // StopwatchSlice
  stopwatchElapsedMs: number
  stopwatchIsRunning: boolean
  stopwatchStartTimestamp: number | null
}
