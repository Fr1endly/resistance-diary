import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '@/store/useAppStore'

interface ChartDataPoint {
  label: string
  value: number
}

interface VolumeChartData {
  chartData: Array<ChartDataPoint>
  totalVolume: number
}

export function useVolumeChartData(daysBack: number = 31): VolumeChartData {
  const { completedSets } = useAppStore(
    useShallow((state) => ({
      completedSets: state.completedSets,
    })),
  )

  return useMemo(() => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysBack)

    // Aggregate volume by date
    const volumeByDate: Record<string, number> = {}
    let total = 0

    for (const set of completedSets) {
      // Filter by date range
      if (new Date(set.completedAt) < cutoffDate) {
        continue
      }

      const dateKey = new Date(set.completedAt).toISOString().split('T')[0]
      const setVolume = set.repGroups.reduce(
        (sum, group) => sum + group.reps * group.weight,
        0,
      )

      volumeByDate[dateKey] = (volumeByDate[dateKey] || 0) + setVolume
      total += setVolume
    }

    // Sort by date
    const chartData = Object.entries(volumeByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ label: date, value }))

    return { chartData, totalVolume: total }
  }, [completedSets, daysBack])
}
