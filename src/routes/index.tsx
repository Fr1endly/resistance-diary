import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from "react"
import { Link } from "@tanstack/react-router";
import {useAppStore} from "@/store/useAppStore";
import { useVolumeChartData } from "@/hooks/useVolumeChartData";
import Layout from "@/components/ui/PageLayout";
import { Button } from "@/components/ui/button"
import ArrowDiagonal from "@/components/icons/ArrowDiagonal";
import Chart from "@/components/charts/IndexChart";
import { populateStoreWithMockData } from '@/lib/mockData';

// import type { WorkoutLogEntry, WorkoutPlan } from "@/types";


export const Route = createFileRoute('/')({
  component: IndexPage,
})

interface ChartTitleProps {
  subtitle: string;
}

interface CurrentDayWorkoutProps {
  activeWorkout: any
  // activeWorkout: WorkoutPlan | null;
  activeDayIdx: number;
}

interface ActionButtonProps {
  url: string;
  text: string;
  onClick?: () => void;
}

const ChartTitle = ({ subtitle }: ChartTitleProps) => {
  return (
    <div className='flex-1 h-full pl-5'>
      <p className='font-display text-neutral-300/95 text-lg'>This week volume</p>
      <p className='font-display  text-neutral-400'>{subtitle}</p>
    </div>
  )
}

const CurrentDayWorkout = ({ activeWorkout, activeDayIdx }: CurrentDayWorkoutProps) => {
  const workoutName = activeWorkout?.name || "No Active Workout";
  const dayName = activeWorkout?.days[activeDayIdx]?.name || "No Active Day";

  return (
    <div className='font-display'>
      <h2 className='text-xl font-bold text-neutral-950'>{workoutName}</h2>
      <h3 className='font-medium text-lg text-neutral-900/95'>{dayName}</h3>
    </div>
  )
}


const ActionButton = ({ url, text, onClick }: ActionButtonProps) => {
  return (
    <Button
      variant='default'
      className='w-[250px] h-[75px] rounded-md text-2xl font-bold uppercase text-neutral-100 bg-neutral-900 px-2 py-1'
      onClick={onClick}
    >
      <Link to={url} className="flex justify-center items-center w-full h-full">
        <div className="size-6"></div>
        <span className="flex-1">{text}</span>
        {url == "/workouts" && <ArrowDiagonal className="ml-2 size-6" />}
      </Link>
    </Button>
  )
}

function IndexPage() {
  const {isWorkoutInProgress, currentDayIndex, activeRoutineId, routines } = useAppStore();
  const { chartData, totalVolume } = useVolumeChartData(7);
  
  const activeWorkout = routines.find(routine => routine.id === activeRoutineId) || null;
  const actionUrl = !activeWorkout ? "/workouts" : isWorkoutInProgress ? "/training" : "/overview";
  const actionText = !activeWorkout ? "Select" : isWorkoutInProgress ? "Continue" : "Start";

  useEffect(() => {
    routines.length === 0 && populateStoreWithMockData();
  }, []);

  return (
    <Layout
      middleLeftSlot={<ChartTitle subtitle={`Total: ${totalVolume.toLocaleString()} kg`} />}
      middleRightSlot={<Chart data={chartData} orientation="vertical" title="Workout Volume" />}
      bottomUpper={<CurrentDayWorkout activeWorkout={activeWorkout} activeDayIdx={currentDayIndex} />}
      bottomBottom={<ActionButton url={actionUrl} text={actionText} />}
    />
  );
}
