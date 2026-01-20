import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '@/store/useAppStore'

interface ChartDataPoint {
    label: string
    value: number
}

interface MuscleGroupVolumeData {
    chartData: Array<ChartDataPoint>
    totalVolume: number
}

export function useMuscleGroupVolumeData(daysBack: number = 31): MuscleGroupVolumeData {
    const { completedSets, exercises, muscleGroups } = useAppStore(
        useShallow((state) => ({
            completedSets: state.completedSets,
            exercises: state.exercises,
            muscleGroups: state.muscleGroups,
        })),
    )

    return useMemo(() => {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - daysBack)

        // Aggregate volume by muscle group
        const volumeByMuscle: Record<string, number> = {}
        let total = 0

        for (const set of completedSets) {
            // Filter by date range
            if (new Date(set.completedAt) < cutoffDate) {
                continue
            }

            // Find the exercise for this set
            const exercise = exercises.find((ex) => ex.id === set.exerciseId)
            if (!exercise) continue

            // Calculate set volume
            const setVolume = set.repGroups.reduce(
                (sum, group) => sum + group.reps * group.weight,
                0,
            )

            // Distribute volume across muscle groups by percentage
            for (const contribution of exercise.muscleContributions) {
                const muscleVolume = Math.round(setVolume * (contribution.percentage / 100))
                volumeByMuscle[contribution.muscleGroupId] =
                    (volumeByMuscle[contribution.muscleGroupId] || 0) + muscleVolume
            }

            total += setVolume
        }

        // Convert to chart data with muscle names
        const chartData = Object.entries(volumeByMuscle)
            .map(([muscleId, value]) => {
                const muscle = muscleGroups.find((mg) => mg.id === muscleId)
                return {
                    label: muscle?.name || muscleId,
                    value,
                }
            })
            .sort((a, b) => b.value - a.value) // Sort by volume descending

        return { chartData, totalVolume: total }
    }, [completedSets, exercises, muscleGroups, daysBack])
}
