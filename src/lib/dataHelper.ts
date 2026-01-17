import type { Exercise, MuscleGroup, WorkoutRoutine } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import {
  DEFAULT_EXERCISES,
  DEFAULT_MUSCLE_GROUPS,
  DEFAULT_ROUTINES,
} from '@/lib/defaultData'

export const dataHelper = {
  // Add a routine
  addRoutine: (routine: WorkoutRoutine) => {
    useAppStore.getState().addRoutine(routine)
    console.log('Routine added:', routine)
  },
  // Delete a repGroups
  resetHistory: () => {
    useAppStore.getState().removeAllCompletedSets()
    console.log('Workout history reset')
  },
}

// Development helper
if (import.meta.env.DEV) {
  // @ts-ignore: window.dataHelper is not in global types
  window.dataHelper = dataHelper
  console.log(
    '%cdataHelper available in console',
    'color: #22d3ee; font-weight: bold;',
  )
}
