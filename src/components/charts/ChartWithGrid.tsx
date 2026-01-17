import { cva } from 'class-variance-authority'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface ChartProps {
  /** Array of sets, each containing an array of rep groups */
  processedData: Array<Array<{ weight: number; reps: number }>>
  title?: string
  /** Number of staged sets at the end of processedData (shown in different color) */
  stagedCount?: number
  currentCount: number
}

type BarType = 'unstaged' | 'staged' | 'completed'

const barVariants = cva(
  'flex flex-col justify-between items-center px-0.5 relative z-10',
  {
    variants: {
      type: {
        staged: 'bg-blue-500',
        completed: 'bg-amber-500',
        unstaged: 'bg-gray-300',
      },
    },
    defaultVariants: {
      type: 'completed',
    },
  },
)

// Memoized bar component to prevent unnecessary re-renders
const ChartBar = memo(
  ({
    weight,
    heightPercent,
    isLast,
    type = 'completed',
    lastBarRef,
  }: {
    weight: number
    heightPercent: number
    isLast: boolean
    type?: BarType
    lastBarRef: React.RefObject<HTMLDivElement | null>
  }) => (
    <div
      ref={isLast ? lastBarRef : null}
      className={cn(barVariants({ type }))}
      style={{
        height: `${heightPercent}%`,
        width: '20px',
        minWidth: '10px',
      }}
      title={`${weight}kg`}
    />
  ),
)

// Memoized set label
const SetLabel = memo(({ setNumber }: { setNumber: number }) => (
  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] text-neutral-400 whitespace-nowrap font-display">
    Set {setNumber}
  </span>
))

function Chart({
  processedData,
  title,
  stagedCount = 0,
  currentCount,
}: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lastBarRef = useRef<HTMLDivElement>(null) // Used to scroll to the last bar on data update
  const [gridWidth, setGridWidth] = useState(0)

  // Calculate where staged sets start
  const stagedStartIndex = processedData.length - stagedCount

  // Flatten all rep groups to find max weight
  const allRepGroups = useMemo(() => processedData.flat(), [processedData])

  // Memoize max height calculation
  const maxWeight = useMemo(
    () => Math.max(...allRepGroups.map((rg) => rg.weight), 100),
    [allRepGroups],
  )

  // Memoize derived values for Y-axis scale
  const gridMaxHeight = useMemo(() => maxWeight * 2, [maxWeight])
  const yAxisStep = useMemo(() => gridMaxHeight / 10, [gridMaxHeight])

  // Memoize Y-axis labels array
  const yAxisLabels = useMemo(
    () =>
      Array.from({ length: 11 }, (_, index) => Math.round(yAxisStep * index)),
    [yAxisStep],
  )

  // Memoize grid lines style
  const gridLineStyle = useMemo(
    () => ({
      height: `${100 / 20}%`,
      width: `${gridWidth}px`,
    }),
    [gridWidth],
  )

  // Calculate height percentage helper
  const getHeightPercent = useCallback(
    (weight: number) => ((weight / maxWeight) * 100) / 2,
    [maxWeight],
  )

  // Expand rep groups into individual bars and count total for scroll tracking
  const totalBars = useMemo(
    () => processedData.flat().reduce((sum, rg) => sum + rg.reps, 0),
    [processedData],
  )

  // Update grid width on data change
  useEffect(() => {
    if (containerRef.current) {
      setGridWidth(containerRef.current.scrollWidth)
    }

    if (lastBarRef.current && containerRef.current) {
      lastBarRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'end',
      })
    }
  }, [totalBars])

  // DELETE LATER
  useEffect(() => {
    console.log(
      'Processed Data:',
      processedData,
      '\n Current Count:',
      currentCount,
    )
  }, [processedData])

  // Precompute last index for ref assignment
  const lastSetIndex = processedData.length - 1

  return (
    <>
      <div className="flex justify-stretch items-stretch h-full w-full">
        <div className="flex flex-col-reverse justify-between items-end h-full border-r border-black text-right bg-transparent w-7 pb-6">
          {/* Y axis labels */}
          {yAxisLabels.map((value, index) => (
            <div
              key={index}
              className="w-full text-xs text-neutral-50 relative"
            >
              <span className="absolute -bottom-2 left-0">{value}</span>
            </div>
          ))}
        </div>

        <div
          ref={containerRef}
          className="flex-1 h-full w-full flex justify-start items-end gap-0.5 relative border-t border-l border-neutral-50/40 overflow-x-scroll pb-6"
        >
          {/* Add grid lines */}
          <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col-reverse justify-between pointer-events-none">
            {Array.from({ length: 20 }).map((_, index) => (
              <div
                key={index}
                className="border-b border-neutral-50/40"
                style={gridLineStyle}
              />
            ))}
          </div>

          {/* Bars - grouped by set, expanded by reps */}
          <div className="flex items-end gap-8 h-full">
            {processedData.map((setRepGroups, setIndex) => {
              // Determine if this set is staged (at the end)
              const isStaged = setIndex >= stagedStartIndex

              // Expand rep groups into individual bars, grouped by weight
              const expandedBars: Array<{ weight: number; barIndex: number }> =
                []
              setRepGroups.forEach((rg) => {
                for (let i = 0; i < rg.reps; i++) {
                  expandedBars.push({
                    weight: rg.weight,
                    barIndex: expandedBars.length,
                  })
                }
              })

              // Total bars in this set (used to determine unstaged threshold)
              const totalBarsInSet = expandedBars.length

                // Group expanded bars by weight for visual stacking (using Map to preserve insertion order)
                const groupedByWeight = new Map<
                  number,
                  Array<{ weight: number; barIndex: number }>
                >()

                expandedBars.forEach((bar) => {
                  if (!groupedByWeight.has(bar.weight)) {
                    groupedByWeight.set(bar.weight, [])
                  }
                  groupedByWeight.get(bar.weight)!.push(bar)
                })

                const weightGroups = Array.from(groupedByWeight.entries())
              const lastWeightIndex = weightGroups.length - 1
              const isLastSet = setIndex === lastSetIndex

              return (
                <div
                  key={setIndex}
                  className="flex items-end gap-1 h-full relative"
                >
                    {weightGroups.map(([weight, bars], weightIndex) => {
                      const heightPercent = getHeightPercent(weight)
                    const lastBarIndex = bars.length - 1

                    return (
                      <div
                          key={`${setIndex}-${weight}-${weightIndex}`}
                        className="flex flex-col justify-end items-center gap-1 h-full relative"
                      >
                        <span
                          className="text-xs text-neutral-200 absolute whitespace-nowrap left-1/2 -translate-x-1/2"
                          style={{ bottom: `calc(${heightPercent}% + 6px)` }}
                        >
                            {weight}kg
                        </span>
                        <div className="flex items-end gap-0.5 h-full">
                          {bars.map((bar, barIdx) => (
                            <ChartBar
                              key={barIdx}
                              weight={bar.weight}
                              heightPercent={getHeightPercent(bar.weight)}
                              isLast={
                                isLastSet &&
                                weightIndex === lastWeightIndex &&
                                barIdx === lastBarIndex
                              }
                              type={
                                isLastSet &&
                                currentCount > 0 &&
                                bar.barIndex >= totalBarsInSet - currentCount
                                  ? 'unstaged'
                                  : isStaged
                                  ? 'staged'
                                  : 'completed'
                              }
                              lastBarRef={lastBarRef}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  <SetLabel setNumber={setIndex + 1} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {title && (
        <div className="text-sm text-neutral-200 text-right px-6 pt-6 pb-2 font-display">
          {title}
        </div>
      )}
    </>
  )
}

export default memo(Chart)
