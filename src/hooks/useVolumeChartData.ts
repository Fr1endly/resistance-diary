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
  const { activeRoutineId, sessions, completedSets } = useAppStore(
    useShallow((state) => ({
      activeRoutineId: state.activeRoutineId,
      sessions: state.sessions,
      completedSets: state.completedSets,
    })),
  )

  return useMemo(() => {
    if (!activeRoutineId) return { chartData: [], totalVolume: 0 }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysBack)

    // Get session IDs from recent sessions for active routine
    const recentSessionIds = new Set(
      sessions
        .filter(
          (session) =>
            session.routineId === activeRoutineId &&
            new Date(session.startedAt) >= cutoffDate,
        )
        .map((session) => session.id),
    )

    // Aggregate volume by date
    const volumeByDate: Record<string, number> = {}
    let total = 0

    for (const set of completedSets) {
      if (!recentSessionIds.has(set.sessionId)) continue

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
  }, [activeRoutineId, sessions, completedSets, daysBack])
}
