export type TimeRange = 'week' | 'month'
export type ChartCategory = 'total' | 'muscle'

export interface IndexChartProps {
  chartData: Array<{ label: string; value: number }>
  totalVolume: number
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
  chartCategory: ChartCategory
  onChartCategoryChange: (category: ChartCategory) => void
}

const TimeRangeToggle = ({
  timeRange,
  onTimeRangeChange,
}: {
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
}) => {
  return (
    <div className="flex gap-1 p-0.5 bg-neutral-800/80 rounded-lg">
      <button
        onClick={() => onTimeRangeChange('week')}
        className={`px-3 py-1 text-sm font-body rounded-xs transition-all duration-200 ${timeRange === 'week'
          ? 'bg-neutral-900/90 text-neutral-100 font-medium'
          : 'text-neutral-400 hover:text-neutral-300'
          }`}
      >
        Week
      </button>
      <button
        onClick={() => onTimeRangeChange('month')}
        className={`px-3 py-1 text-sm font-body rounded-md transition-all duration-200 ${timeRange === 'month'
          ? 'bg-neutral-900/90 text-neutral-100 font-medium'
          : 'text-neutral-400 hover:text-neutral-300'
          }`}
      >
        Month
      </button>
    </div>
  )
}

const ChartCategoryToggle = ({
  chartCategory,
  onChartCategoryChange,
}: {
  chartCategory: ChartCategory
  onChartCategoryChange: (category: ChartCategory) => void
}) => {
  return (
    <div className="flex gap-1 p-0.5 bg-neutral-800/70 rounded-lg">
      <button
        onClick={() => onChartCategoryChange('total')}
        className={`px-3 py-1 text-sm font-body rounded-xs transition-all duration-200 ${chartCategory === 'total'
          ? 'bg-neutral-900/90 text-neutral-100 font-medium'
          : 'text-neutral-400 hover:text-neutral-300'
          }`}
      >
        Total
      </button>
      <button
        onClick={() => onChartCategoryChange('muscle')}
        className={`px-3 py-1 text-sm font-body rounded-md transition-all duration-200 ${chartCategory === 'muscle'
          ? 'bg-neutral-900/90 text-neutral-100 font-medium'
          : 'text-neutral-400 hover:text-neutral-300'
          }`}
      >
        Muscle
      </button>
    </div>
  )
}

export default ({
  chartData,
  totalVolume,
  timeRange,
  onTimeRangeChange,
  chartCategory,
  onChartCategoryChange
}: IndexChartProps) => {
  const titleText = chartCategory === 'muscle'
    ? 'Volume by muscle'
    : (timeRange === 'week' ? 'This week volume' : 'This month volume')
  const maxValue = Math.max(...chartData.map((item) => item.value), 100)

  return (
    <div className="flex-1 h-full w-full flex flex-col">
      {/* Fixed Header */}
      <div className="shrink-0 px-4 pt-2 pb-1">
        <p className="font-display text-neutral-300/95 text-lg">{titleText}</p>
        <p className="font-body text-neutral-400 text-sm">Total: {totalVolume.toLocaleString()} kg</p>
      </div>

      {/* Scrollable Chart Bars */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className={`flex ${chartCategory === 'muscle' ? 'flex-col' : 'flex-col-reverse'} justify-start items-end gap-1`}>
          {chartData.map(({ label, value }, index) => (
            <div
              key={index}
              className="flex items-center gap-2 w-full"
              style={{ minHeight: '28px' }}
            >
              <span className="text-xs text-neutral-400 w-20 text-right shrink-0">
                {label}
              </span>
              <div
                className="bg-yellow-500 h-6 flex items-center justify-end px-1 rounded-xs"
                style={{ width: `calc(${(value / maxValue) * 100}% )`, minWidth: value > 0 ? '40px' : '0' }}
              >
                <span className="text-xs font-medium text-neutral-900 text-nowrap">
                  {value > 0 ? `${value} kg` : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="shrink-0 px-4 py-2 flex justify-center gap-3">
        <ChartCategoryToggle chartCategory={chartCategory} onChartCategoryChange={onChartCategoryChange} />
        <TimeRangeToggle timeRange={timeRange} onTimeRangeChange={onTimeRangeChange} />
      </div>
    </div>
  )
}
