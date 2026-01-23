import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { useVolumeChartData } from '@/hooks/useVolumeChartData'
import { useMuscleGroupVolumeData } from '@/hooks/useMuscleGroupVolumeData'
import Layout from '@/components/ui/PageLayout'
import { Button } from '@/components/ui/button'
import ArrowDiagonal from '@/components/icons/ArrowDiagonal'
import IndexChart, { type TimeRange, type ChartCategory } from '@/components/charts/IndexChart'
import { useActiveTrainingSession } from '@/hooks/useActiveTrainingSession'
import { useShallow } from 'zustand/react/shallow'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

interface CurrentDayWorkoutProps {
  activeWorkout: any
  // activeWorkout: WorkoutPlan | null;
  activeDayIdx: number
}

const CurrentDayWorkout = ({
  activeWorkout,
  activeDayIdx,
}: CurrentDayWorkoutProps) => {
  const workoutName = activeWorkout?.name || 'No Active Workout'
  const dayName = activeWorkout?.days[activeDayIdx]?.name || 'No Active Day'

  return (
    <div className="font-display  space-y-2">
      <div>
        <span className="text-[10px] uppercase font-bold text-neutral-900/40 tracking-wider block mb-0.5">
          Workout
        </span>
        <h2 className="text-xl font-bold text-neutral-950 leading-tight">
          {workoutName}
        </h2>
      </div>
      <div>
        <span className="text-[10px] uppercase font-bold text-neutral-900/40 tracking-wider block mb-0.5">
          Day
        </span>
        <h3 className="font-body font-medium text-lg text-neutral-900/95 leading-tight">
          {dayName}
        </h3>
      </div>
    </div>
  )
}

interface LinkButtonProps {
  to: string
  text: string
  showIcon?: boolean
}

interface ActionButtonProps {
  text: string
  onClick: () => void
  variant?: "default" | "destructive"
}

const baseButtonStyles = cn(
  "h-14 min-h-14 box-border", // Force consistent height
  "rounded-md text-xl font-display font-medium uppercase px-6",
  "text-neutral-100 bg-neutral-900 hover:bg-neutral-800 transition-colors"
)

const LinkButton = ({ to, text, showIcon = false }: LinkButtonProps) => {
  return (
    <Button
      variant="default"
      className={baseButtonStyles}
      asChild
    >
      <Link to={to} className="flex justify-center items-center w-full h-full">
        {showIcon && <div className="size-6" />}
        <span className="flex-1 text-center">{text}</span>
        {showIcon && <ArrowDiagonal className="ml-2 size-6" />}
      </Link>
    </Button>
  )
}

const ActionButton = ({ text, onClick }: ActionButtonProps) => {
  return (
    <Button
      variant="default"
      className={baseButtonStyles}
      onClick={onClick}
    >
      <span className="w-full text-center">
        {text}
      </span>
    </Button>
  )
}

function IndexPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [chartCategory, setChartCategory] = useState<ChartCategory>('total')

  const { isWorkoutInProgress, currentDayIndex, completeSession } = useActiveTrainingSession()
  const { routines, activeRoutineId } = useAppStore(
    useShallow((state) => ({
      routines: state.routines,
      activeRoutineId: state.activeRoutineId,
    })),
  )

  const daysBack = timeRange === 'week' ? 7 : 30

  // Get data from both hooks
  const totalVolumeData = useVolumeChartData(daysBack)
  const muscleVolumeData = useMuscleGroupVolumeData(daysBack)

  // Select which data to display based on category
  const { chartData, totalVolume } = chartCategory === 'muscle'
    ? muscleVolumeData
    : totalVolumeData

  const activeWorkout =
    routines.find((routine) => routine.id === activeRoutineId) || null
  const actionUrl = !activeWorkout
    ? '/workouts'
    : isWorkoutInProgress
      ? '/training'
      : '/overview'
  const actionText = !activeWorkout
    ? 'Select'
    : isWorkoutInProgress
      ? 'Continue'
      : 'Start'

  return (
    <Layout
      middleSlot={
        <IndexChart
          chartData={chartData}
          totalVolume={totalVolume}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          chartCategory={chartCategory}
          onChartCategoryChange={setChartCategory}
        />
      }

      bottomSlot={
        <div className="w-full h-full flex flex-col justify-between">
          <div className="flex-1 flex flex-col justify-start items-start">
            <CurrentDayWorkout
              activeWorkout={activeWorkout}
              activeDayIdx={currentDayIndex}
            />
          </div>
          <div className="flex-1 flex justify-start items-end gap-3">
            <div className="">
              <LinkButton
                to={actionUrl}
                text={actionText}
                showIcon={!activeWorkout}
              />
            </div>
            {isWorkoutInProgress && (
              <div className="">
                <ActionButton
                  text="Finish"
                  onClick={() => completeSession()}
                />
              </div>
            )}
          </div>
        </div>
      }
    />
  )
}

