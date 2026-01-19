import { Link, createFileRoute } from '@tanstack/react-router'
import { Dumbbell, Play, SkipForward, Target } from 'lucide-react'
import { nanoid } from 'nanoid'

import { useShallow } from 'zustand/react/shallow'
import type { Exercise, PlannedSet } from '@/types'
import PageLayout from '@/components/ui/PageLayout'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

export const Route = createFileRoute('/overview')({
  component: Page,
})

interface ExerciseWithSets {
  exercise: Exercise
  sets: Array<PlannedSet>
}

interface WorkoutDaySectionProps {
  name: string
  exercises: Array<ExerciseWithSets>
  setCount: number
  onStartSession: () => void
}

function getRepRange(sets: Array<PlannedSet>): string {
  if (sets.length === 0) return '0'
  const reps = sets.map((s) => s.targetReps)
  const min = Math.min(...reps)
  const max = Math.max(...reps)
  return min === max ? `${min}` : `${min}-${max}`
}

function WorkoutDaySection({
  exercises,
  name,
  setCount,
  onStartSession,
}: WorkoutDaySectionProps) {
  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Day Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
            Today's Workout
          </p>
          <h3 className="font-display text-2xl font-bold text-white">{name}</h3>
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            'backdrop-blur-md bg-amber-500/20 border border-amber-400/30',
          )}
        >
          <Dumbbell size={22} className="text-amber-400" />
        </div>
      </div>

      {/* Stats Overview */}
      <div
        className={cn(
          'flex items-center gap-4 py-4 px-5 rounded-2xl',
          'backdrop-blur-xl bg-white/5 border border-white/10',
        )}
      >
        <div className="text-center flex-1">
          <div className="text-3xl font-bold text-amber-400 font-mono">
            {exercises.length}
          </div>
          <div className="text-xs text-white/40 uppercase tracking-wider mt-1">
            Exercises
          </div>
        </div>
        <div className="h-12 w-px bg-white/10" />
        <div className="text-center flex-1">
          <div className="text-3xl font-bold text-amber-400 font-mono">
            {setCount}
          </div>
          <div className="text-xs text-white/40 uppercase tracking-wider mt-1">
            Total Sets
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-3 overflow-y-auto flex-1 -mx-1 px-1">
        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
          <Target size={12} />
          Exercises
        </h4>
        {exercises.map((item, idx) => (
          <div
            key={item.exercise.id}
            className={cn(
              'rounded-2xl p-4',
              'backdrop-blur-xl bg-white/5 border border-white/10',
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full',
                  'bg-amber-500/20 border border-amber-400/30',
                  'text-amber-400 font-bold font-mono text-sm',
                )}
              >
                {idx + 1}
              </div>
              <div className="flex-1">
                <h5 className="font-display text-lg text-white/90">
                  {item.exercise.name}
                </h5>
                <p className="text-xs text-white/40">
                  {item.sets.length} sets · {getRepRange(item.sets)} reps
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 ml-13">
              {item.sets.map((set, setIdx) => (
                <div
                  key={set.id}
                  className={cn(
                    'px-3 py-1.5 rounded-lg',
                    'bg-white/5 border border-white/10',
                    'text-xs font-mono text-white/50',
                  )}
                >
                  Set {setIdx + 1}: {set.targetReps} reps
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-3">
        <Link to="/training/details" className="block">
          <button
            onClick={onStartSession}
            className={cn(
              'w-full h-14 rounded-2xl font-semibold text-base',
              'backdrop-blur-md bg-emerald-500/20 border border-emerald-400/30',
              'text-emerald-100 transition-all duration-200',
              'hover:bg-emerald-500/30 hover:border-emerald-400/50',
              'active:scale-[0.98]',
              'flex items-center justify-center gap-2',
            )}
          >
            <Play size={20} fill="currentColor" />
            Start Workout
          </button>
        </Link>
        <button
          className={cn(
            'w-full h-12 rounded-2xl font-medium text-sm',
            'backdrop-blur-md bg-white/5 border border-white/10',
            'text-white/60 transition-all duration-200',
            'hover:bg-white/10 hover:text-white/80',
            'active:scale-[0.98]',
            'flex items-center justify-center gap-2',
          )}
        >
          <SkipForward size={18} />
          Skip Day
        </button>
      </div>
    </div>
  )
}

function Page() {
  const {
    currentDayIndex,
    activeRoutineId,
    routines,
    exercises,
    startSession,
  } = useAppStore(
    useShallow((state) => ({
      currentDayIndex: state.currentDayIndex,
      activeRoutineId: state.activeRoutineId,
      routines: state.routines,
      exercises: state.exercises,
      startSession: state.startSession,
    })),
  )

  const activeRoutine = routines.find((r) => r.id === activeRoutineId)
  const activeDay = activeRoutine?.days[currentDayIndex]
  const plannedSets = activeDay?.plannedSets ?? []

  const exerciseData: Array<ExerciseWithSets> = [
    ...new Set(plannedSets.map((s) => s.exerciseId)),
  ]
    .map((exerciseId) => ({
      exercise: exercises.find((ex) => ex.id === exerciseId),
      sets: plannedSets.filter((s) => s.exerciseId === exerciseId),
    }))
    .filter((item) => item.exercise !== undefined) as Array<ExerciseWithSets>

  const handleStartSession = () => {
    if (!activeRoutine || !activeDay) return
    startSession({
      id: nanoid(),
      routineId: activeRoutine.id,
      dayId: activeDay.id,
    })
  }

  return (
    <PageLayout
      variant="glass"
      bottomSlot={
        <WorkoutDaySection
          name={activeDay?.name ?? ''}
          exercises={exerciseData}
          setCount={plannedSets.length}
          onStartSession={handleStartSession}
        />
      }
    />
  )
}
