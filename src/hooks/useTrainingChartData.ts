import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { RepGroup } from '@/types'
import { useAppStore } from '@/store/useAppStore'

interface TrainingChartDataParams {
  exerciseId: string | undefined
  stagedRepGroups: RepGroup[]
  currentReps: number
  currentWeight: number
}

interface TrainingChartDataResult {
  chartData: Array<Array<RepGroup>>
  stagedCount: number
}

export function useTrainingChartData({
  exerciseId,
  stagedRepGroups,
  currentReps,
  currentWeight,
}: TrainingChartDataParams): TrainingChartDataResult {
  const completedSets = useAppStore(
    useShallow((state) => state.completedSets),
  )

  return useMemo(() => {
    // Get all completed sets for this exercise (historic + current session)
    const allExerciseCompletedSets = completedSets.filter(
      (cs) => cs.exerciseId === exerciseId,
    )
    const data = allExerciseCompletedSets.map((cs) => cs.repGroups)
    let staged = 0

    // Add staged as preview
    if (stagedRepGroups.length > 0 || currentReps > 0) {
      const preview = [...stagedRepGroups]
      if (currentReps > 0) {
        preview.push({ reps: currentReps, weight: currentWeight, order: preview.length })
      }
      data.push(preview)
      staged = 1
    }

    return { chartData: data, stagedCount: staged }
  }, [completedSets, exerciseId, stagedRepGroups, currentReps, currentWeight])
}
