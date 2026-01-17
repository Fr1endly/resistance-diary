import { memo, useMemo } from 'react'
import type { RepGroup } from '@/types'
import Chart from '@/components/charts/ChartWithGrid'

interface TrainingChartProps {
  data: Array<Array<RepGroup>>
  stagedCount?: number
  currentCount: number
}

export const TrainingChart = memo(function TrainingChart({
  data,
  stagedCount = 0,
  currentCount = 0,
}: TrainingChartProps) {
  const processedData = useMemo(() => {
    if (!data.length) return []
    return data.map((repGroups) =>
      repGroups.map((rg) => ({
        weight: rg.weight,
        reps: rg.reps,
      })),
    )
  }, [data])

  return (
    <div className="w-full h-70 flex items-start justify-center bg-black/20 rounded-xs py-4">
      <div className="w-full h-full max-h-70 overflow-hidden p-2">
        <Chart
          processedData={processedData}
          title=""
          stagedCount={stagedCount}
          currentCount={currentCount}
        />
      </div>
    </div>
  )
})
