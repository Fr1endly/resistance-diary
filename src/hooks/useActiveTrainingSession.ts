import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { Exercise, PlannedSet } from '@/types'
import { useAppStore } from '@/store/useAppStore'

export interface ActiveTrainingSessionData {
  isWorkoutInProgress: boolean
  activeSessionId: string | null
  activeRoutineId: string | null
  activeDayId: string | undefined
  currentSetIndex: number
  plannedSets: Array<PlannedSet>
  currentPlannedSet: PlannedSet | undefined
  currentExercise: Exercise | undefined
  currentSetForExercise: number
  currentExerciseProgress: { total: number; completed: number }
  // Actions
  addCompletedSet: typeof useAppStore.getState extends () => infer S
  ? S extends { addCompletedSet: infer F }
  ? F
  : never
  : never
  nextSet: () => void
  completeSession: () => void
  updatePlannedSet: typeof useAppStore.getState extends () => infer S
  ? S extends { updatePlannedSet: infer F }
  ? F
  : never
  : never
}

export function useActiveTrainingSession(): ActiveTrainingSessionData {
  const {
    isWorkoutInProgress,
    activeSessionId,
    activeRoutineId,
    currentDayIndex,
    currentSetIndex,
    routines,
    exercises,
    completedSets,
    sessions,
    addCompletedSet,
    updatePlannedSet,
    nextSet,
    completeSession,
  } = useAppStore(
    useShallow((state) => ({
      isWorkoutInProgress: state.isWorkoutInProgress,
      activeSessionId: state.activeSessionId,
      activeRoutineId: state.activeRoutineId,
      currentDayIndex: state.currentDayIndex,
      currentSetIndex: state.currentSetIndex,
      routines: state.routines,
      exercises: state.exercises,
      completedSets: state.completedSets,
      sessions: state.sessions,
      addCompletedSet: state.addCompletedSet,
      updatePlannedSet: state.updatePlannedSet,
      nextSet: state.nextSet,
      completeSession: state.completeSession,
    })),
  )

  // Get active routine and day
  const activeRoutine = useMemo(
    () => routines.find((r) => r.id === activeRoutineId),
    [routines, activeRoutineId],
  )

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId),
    [sessions, activeSessionId],
  )

  const activeDay = useMemo(
    () => activeRoutine?.days.find((d) => d.id === activeSession?.dayId),
    [activeRoutine, activeSession],
  )

  const plannedSets = useMemo(() => activeDay?.plannedSets ?? [], [activeDay])

  const currentPlannedSet = plannedSets[currentSetIndex] as
    | PlannedSet
    | undefined

  const currentExercise = useMemo(
    () => exercises.find((ex) => ex.id === currentPlannedSet?.exerciseId),
    [exercises, currentPlannedSet],
  )

  // Group planned sets by exercise to calculate total sets per exercise
  const exerciseSetCounts = useMemo(() => {
    const counts: Record<
      string,
      { total: number; completed: number } | undefined
    > = {}
    plannedSets.forEach((ps) => {
      if (!counts[ps.exerciseId]) {
        counts[ps.exerciseId] = { total: 0, completed: 0 }
      }
      counts[ps.exerciseId]!.total++
    })
    // Count completed sets
    const sessionSets = completedSets.filter(
      (cs) => cs.sessionId === activeSessionId,
    )
    sessionSets.forEach((cs) => {
      if (counts[cs.exerciseId]) {
        counts[cs.exerciseId]!.completed++
      }
    })
    return counts
  }, [plannedSets, completedSets, activeSessionId])

  // Current exercise progress
  const currentExerciseProgress = currentExercise
    ? (exerciseSetCounts[currentExercise.id] ?? { total: 0, completed: 0 })
    : { total: 0, completed: 0 }

  // Calculate which set number this is for the current exercise
  const currentSetForExercise = useMemo(() => {
    if (!currentPlannedSet) return 1
    let count = 0
    for (let i = 0; i <= currentSetIndex && i < plannedSets.length; i++) {
      if (plannedSets[i].exerciseId === currentPlannedSet.exerciseId) {
        count++
      }
    }
    return count
  }, [plannedSets, currentSetIndex, currentPlannedSet])

  return {
    isWorkoutInProgress,
    activeSessionId,
    activeRoutineId,
    activeDayId: activeSession?.dayId,
    currentSetIndex,
    plannedSets,
    currentPlannedSet,
    currentExercise,
    currentSetForExercise,
    currentExerciseProgress,
    addCompletedSet,
    updatePlannedSet,
    nextSet,
    completeSession: () => {
      // Complete the session in store
      completeSession()

      // Advance to next day
      if (activeRoutine?.days.length) {
        let nextDayIndex = currentDayIndex + 1
        // Wrap around if we reached the end
        if (nextDayIndex >= activeRoutine.days.length) {
          nextDayIndex = 0
        }
        useAppStore.getState().setCurrentDayIndex(nextDayIndex)
      }
    },
  }
}
