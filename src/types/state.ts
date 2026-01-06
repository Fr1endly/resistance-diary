import type { MuscleGroup, Exercise } from './exercise';
import type { WorkoutRoutine } from './workout';
import type { WorkoutSession, CompletedSet } from './session';

export interface UserSettings {
  units: 'metric' | 'imperial';
  name?: string;
  email?: string;
}

/**
 * Application state shape - reflects the combined Zustand store slices
 */
export interface AppState {
  // MuscleSlice
  muscleGroups: MuscleGroup[];

  // ExerciseSlice
  exercises: Exercise[];

  // WorkoutSlice
  routines: WorkoutRoutine[];

  // SessionSlice
  sessions: WorkoutSession[];
  completedSets: CompletedSet[];
  activeSessionId: string | null;
  currentDayIndex: number;
  currentSetIndex: number;
  isWorkoutInProgress: boolean;

  // SettingsSlice
  settings: UserSettings;
  activeRoutineId: string | null;
  isDialogOpen: boolean;

  // StopwatchSlice
  stopwatchElapsedMs: number;
  stopwatchIsRunning: boolean;
  stopwatchStartTimestamp: number | null;
}
