import { useCallback, useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { nanoid } from 'nanoid'

import type { CompletedSet, RepGroup } from '@/types'
import { cn } from '@/lib/utils'
import PageLayout from '@/components/ui/PageLayout'
import {
  FloatingBadge,
  FloatingControls,
  TrainingChart,
} from '@/components/training'
import { useActiveTrainingSession } from '@/hooks/useActiveTrainingSession'
import { useTrainingChartData } from '@/hooks/useTrainingChartData'
import { useToast } from '@/hooks/useToast'

export const Route = createFileRoute('/training/')({
  component: TrainingPage,
})

// ============================================
// MAIN PAGE
// ============================================

function TrainingPage() {
  const navigate = useNavigate()
  const toast = useToast()

  // Get active training session data from custom hook
  const {
    isWorkoutInProgress,
    activeSessionId,
    currentSetIndex,
    plannedSets,
    currentPlannedSet,
    currentExercise,
    currentSetForExercise,
    currentExerciseProgress,
    activeRoutineId,
    activeDayId,
    completedPlannedSetIds,
    addCompletedSet,
    updatePlannedSet,
    setCurrentSetIndex,
    completeSession,
  } = useActiveTrainingSession()

  // Local state for current rep input
  const [reps, setReps] = useState(0)
  const [weight, setWeight] = useState(0)
  const [stagedRepGroups, setStagedRepGroups] = useState<Array<RepGroup>>([])

  // Get chart data from custom hook
  const { chartData, stagedCount } = useTrainingChartData({
    exerciseId: currentPlannedSet?.exerciseId,
    stagedRepGroups,
    currentReps: reps,
    currentWeight: weight,
  })

  // Redirect if not in workout
  useEffect(() => {
    if (!isWorkoutInProgress) {
      navigate({ to: '/' })
    }
  }, [isWorkoutInProgress, navigate])

  // Set default weight from planned set
  useEffect(() => {
    if (currentPlannedSet?.targetWeight) {
      setWeight(currentPlannedSet.targetWeight)
    }
  }, [currentPlannedSet])

  // Reset staged groups and set default reps when moving to next set
  useEffect(() => {
    setStagedRepGroups([])
    if (currentPlannedSet?.targetReps) {
      setReps(currentPlannedSet.targetReps)
    } else {
      setReps(0)
    }
  }, [currentSetIndex, currentPlannedSet])

  // Handlers
  const handleRepsChange = useCallback((value: number) => setReps(value), [])
  const handleWeightChange = useCallback(
    (value: number) => setWeight(value),
    [],
  )

  const handleAddRepGroup = useCallback(() => {
    if (reps <= 0) {
      toast.error('Please add at least one rep')
      return
    }
    const newGroup: RepGroup = {
      reps,
      weight,
      order: stagedRepGroups.length,
    }
    setStagedRepGroups((prev) => [...prev, newGroup])
    setReps(0) // Reset reps for next input
  }, [reps, weight, stagedRepGroups.length, toast])

  const handleUnstage = useCallback(() => {
    setStagedRepGroups((prev) => {
      if (prev.length === 0) return prev
      return prev.slice(0, -1)
    })
  }, [])

  const handleFinishSet = useCallback(() => {
    if (!currentPlannedSet || !activeSessionId) return

    // Include current input if there are reps
    const finalRepGroups = [...stagedRepGroups]
    if (reps > 0) {
      finalRepGroups.push({
        reps,
        weight,
        order: finalRepGroups.length,
      })
    }

    if (finalRepGroups.length === 0) {
      toast.error('Please add at least one rep group before completing the set')
      return
    }

    const completedSet: CompletedSet = {
      id: nanoid(),
      sessionId: activeSessionId,
      exerciseId: currentPlannedSet.exerciseId,
      plannedSetId: currentPlannedSet.id,
      repGroups: finalRepGroups,
      completedAt: new Date(),
    }

    addCompletedSet(completedSet)

    // Progressive Overload Check: Hit rep target and exceed weight target
    if (activeRoutineId && activeDayId) {
      const bestQualifyingWeight = finalRepGroups.reduce((max, group) => {
        const hitsReps = group.reps >= currentPlannedSet.targetReps
        const exceedsWeight = group.weight > (currentPlannedSet.targetWeight || 0)
        if (hitsReps && exceedsWeight) {
          return Math.max(max, group.weight)
        }
        return max
      }, 0)

      if (bestQualifyingWeight > (currentPlannedSet.targetWeight || 0)) {
        updatePlannedSet(activeRoutineId, activeDayId, currentPlannedSet.id, {
          targetWeight: bestQualifyingWeight,
        })
        toast.success(
          `Congratulations! New PR for ${currentExercise?.name}: ${bestQualifyingWeight}kg!`,
        )
      }
    }

    // Check if the entire workout is completed
    // We use the updated list of completed set IDs (which includes the one we just added)
    const updatedCompletedIds = [...completedPlannedSetIds, currentPlannedSet.id]
    const isAllDone = plannedSets.every((ps) => updatedCompletedIds.includes(ps.id))

    if (isAllDone) {
      completeSession()
      navigate({ to: '/' })
      return
    }

    // Find the next unfinished set
    // 1. Look ahead from current index
    let nextUnfinishedIndex = -1
    for (let i = currentSetIndex + 1; i < plannedSets.length; i++) {
      if (!updatedCompletedIds.includes(plannedSets[i].id)) {
        nextUnfinishedIndex = i
        break
      }
    }

    // 2. If not found, look from the beginning
    if (nextUnfinishedIndex === -1) {
      for (let i = 0; i < currentSetIndex; i++) {
        if (!updatedCompletedIds.includes(plannedSets[i].id)) {
          nextUnfinishedIndex = i
          break
        }
      }
    }

    if (nextUnfinishedIndex !== -1) {
      const nextSetObj = plannedSets[nextUnfinishedIndex]
      const isExerciseChanging = nextSetObj.exerciseId !== currentPlannedSet.exerciseId

      // Jump to the next unfinished set
      setCurrentSetIndex(nextUnfinishedIndex)

      // If switching exercises, redirect to details page
      if (isExerciseChanging) {
        navigate({ to: '/training/details' })
      }
    } else {
      // Fallback: This shouldn't happen if isAllDone is false, but just in case
      completeSession()
      navigate({ to: '/' })
    }
  }, [
    currentPlannedSet,
    activeSessionId,
    stagedRepGroups,
    reps,
    weight,
    addCompletedSet,
    currentSetIndex,
    plannedSets,
    completedPlannedSetIds,
    completeSession,
    setCurrentSetIndex,
    navigate,
    toast,
    activeRoutineId,
    activeDayId,
    currentExercise?.name,
  ])

  // Guard
  if (!currentExercise || !currentPlannedSet) {
    return (
      <PageLayout
        variant="sectioned"
        middleSlot={
          <div className="w-full h-64 flex items-center justify-center bg-neutral-200 text-black">
            CANT LOAD DATA
            {JSON.stringify({ currentExercise, currentPlannedSet })}

            {JSON.stringify({ activeSessionId })}
            {JSON.stringify({})}
          </div>
        }

      />

    )
  }

  return (
    <PageLayout
      variant="sectioned"
      upperSlot={
        <FloatingBadge
          exerciseName={currentExercise.name}
          currentSet={currentSetForExercise}
          totalSets={currentExerciseProgress.total}
        />
      }
      middleSlot={
        <div className="w-full h-full flex flex-col justify-end">
          {/* Target badges */}
          <div className="flex justify-center my-4 gap-2">
            <div
              className={cn(
                'px-4 py-1.5 rounded-full',
                'bg-neutral-900 border border-white/10 shadow-lg',
              )}
            >
              <span className="text-neutral-200 text-sm">Target: </span>
              <span className="text-neutral-100 font-mono font-bold">
                {currentPlannedSet.targetReps}
              </span>
              <span className="text-neutral-200 text-sm"> reps</span>
            </div>

            {currentPlannedSet.targetWeight && (
              <div
                className={cn(
                  'px-4 py-1.5 rounded-full',
                  'bg-neutral-900 border border-white/10 shadow-lg',
                )}
              >
                <span className="text-neutral-200 text-sm">Target: </span>
                <span className="text-neutral-100 font-mono font-bold">
                  {currentPlannedSet.targetWeight}
                </span>
                <span className="text-neutral-200 text-sm"> kg</span>
              </div>
            )}
          </div>
          <TrainingChart data={chartData} stagedCount={stagedCount} currentCount={reps} />
        </div>
      }
      bottomSlot={
        <div className="relative w-full h-full flex flex-col justify-end gap-8">
          <FloatingControls
            reps={reps}
            weight={weight}
            onRepsChange={handleRepsChange}
            onWeightChange={handleWeightChange}
            onAddRepGroup={handleAddRepGroup}
            onFinishSet={handleFinishSet}
            onUnstage={handleUnstage}
          />
        </div>
      }
    />
  )
}
