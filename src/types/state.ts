import type { MuscleGroup } from './exercise';
import type { Exercise } from './exercise';
import type { WorkoutRoutine } from './workout';
import type { WorkoutSession, CompletedSet } from './session';

export interface UserSettings {
  units: 'metric' | 'imperial';
  name?: string;
  email?: string;
}

export interface AppState {
  // Data
  muscleGroups: MuscleGroup[];
  exercises: Exercise[];
  routines: WorkoutRoutine[];
  sessions: WorkoutSession[];
  completedSets: CompletedSet[];

  // Active state
  activeRoutineId: string | null;
  activeSessionId: string | null;
  currentDayIndex: number;
  currentSetIndex: number;

  // UI state
  isWorkoutInProgress: boolean;
  isDialogOpen: boolean;

  // Settings
  settings: UserSettings;
}
