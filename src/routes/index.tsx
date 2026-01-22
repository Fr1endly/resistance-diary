import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useAppStore } from '@/store/useAppStore'
import { useVolumeChartData } from '@/hooks/useVolumeChartData'
import { useMuscleGroupVolumeData } from '@/hooks/useMuscleGroupVolumeData'
import Layout from '@/components/ui/PageLayout'
import { Button } from '@/components/ui/button'
import ArrowDiagonal from '@/components/icons/ArrowDiagonal'
import IndexChart, { type TimeRange, type ChartCategory } from '@/components/charts/IndexChart'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

interface CurrentDayWorkoutProps {
  activeWorkout: any
  // activeWorkout: WorkoutPlan | null;
  activeDayIdx: number
}

interface ActionButtonProps {
  url: string
  text: string
  onClick?: () => void
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

const ActionButton = ({ url, text, onClick }: ActionButtonProps) => {
  return (
    <Button
      variant="default"
      className="w-44 h-18.75 rounded-md text-2xl font-display font-medium uppercase text-neutral-100 bg-neutral-900 px-2 py-1"
      onClick={onClick}
    >
      <Link to={url} className="flex justify-center items-center w-full h-full">
        {url == '/workouts' && <div className="size-6"></div>}
        <span className="flex-1">{text}</span>
        {url == '/workouts' && <ArrowDiagonal className="ml-2 size-6" />}
      </Link>
    </Button>
  )
}

function IndexPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [chartCategory, setChartCategory] = useState<ChartCategory>('total')
  const { isWorkoutInProgress, currentDayIndex, activeRoutineId, routines } =
    useAppStore()
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
          <div className="flex-1 flex justify-start items-end">
            <ActionButton url={actionUrl} text={actionText} />
          </div>
        </div>
      }
    />
  )
}

