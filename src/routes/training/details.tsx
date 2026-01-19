import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { forwardRef, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, Play, Repeat, Target, Video } from 'lucide-react'

import { useShallow } from 'zustand/react/shallow'
import type { Exercise, PlannedSet } from '@/types'
import PageLayout from '@/components/ui/PageLayout'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

export const Route = createFileRoute('/training/details')({
  component: TrainingDetailsPage,
})

// ============================================
// TYPES
// ============================================

interface ExerciseWithSets {
  exercise: Exercise
  plannedSets: Array<PlannedSet>
  completedCount: number
}

interface ExerciseCardProps {
  data: ExerciseWithSets
  className?: string
}

// ============================================
// COMPONENTS
// ============================================

const ExerciseCard = forwardRef<HTMLDivElement, ExerciseCardProps>(
  ({ data, className }, ref) => {
    const [isVideosOpen, setIsVideosOpen] = useState(false)
    const { exercise, plannedSets, completedCount } = data

    const totalSets = plannedSets.length
    const totalReps = plannedSets.reduce((acc, set) => acc + set.targetReps, 0)

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full h-full flex flex-col justify-stretch',
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
              Current Exercise
            </p>
            <h3 className="font-display text-2xl font-bold text-white">
              {exercise.name}
            </h3>
          </div>
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              'backdrop-blur-md bg-amber-500/20 border border-amber-400/30',
            )}
          >
            <Target size={22} className="text-amber-400" />
          </div>
        </div>

        {/* Stats Overview - Glass */}
        <div
          className={cn(
            'flex items-center gap-4 py-4 px-5 rounded-2xl mb-4',
            'backdrop-blur-xl bg-white/5 border border-white/10',
          )}
        >
          <div className="text-center flex-1">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-emerald-400 font-mono">
                {completedCount}
              </span>
              <span className="text-lg text-white/40 font-mono">
                / {totalSets}
              </span>
            </div>
            <div className="text-xs text-white/40 uppercase tracking-wider mt-1">
              Progress
            </div>
          </div>
          <div className="h-12 w-px bg-white/10" />
          <div className="text-center flex-1">
            <div className="text-3xl font-bold text-amber-400 font-mono">
              {totalReps}
            </div>
            <div className="text-xs text-white/40 uppercase tracking-wider mt-1">
              Total Reps
            </div>
          </div>
        </div>

        {/* Sets List */}
        {plannedSets.length > 0 && (
          <div className="mb-4 flex-1 overflow-y-auto -mx-1 px-1">
            <div className="flex items-center gap-2 mb-3">
              <Repeat size={12} className="text-white/40" />
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Set Breakdown
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {plannedSets.map((set, i) => {
                const isCompleted = i < completedCount
                const isCurrent = i === completedCount

                return (
                  <div
                    key={set.id}
                    className={cn(
                      'flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition-all',
                      isCompleted
                        ? 'backdrop-blur-md bg-amber-500/20 border-amber-400/30 text-amber-100'
                        : isCurrent
                          ? 'backdrop-blur-md bg-emerald-500/20 border-emerald-400/30 text-emerald-100'
                          : 'backdrop-blur-md bg-white/5 border-white/10 text-white/60 hover:bg-white/10',
                    )}
                  >
                    <span className="text-[10px] font-medium text-white/40 mb-1">
                      SET {i + 1}
                    </span>
                    <span className="font-mono font-semibold text-sm">
                      {set.targetReps} reps
                    </span>
                    {set.targetWeight && (
                      <span className="text-[10px] text-white/40 mt-0.5">
                        {set.targetWeight}kg
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Description if exists */}
        {exercise.description && (
          <div
            className={cn(
              'p-4 rounded-2xl mb-4',
              'backdrop-blur-xl bg-white/5 border border-white/10',
            )}
          >
            <p className="text-sm text-white/70 leading-relaxed">
              {exercise.description}
            </p>
          </div>
        )}

        {/* Notes if exists */}
        {exercise.notes && (
          <div
            className={cn(
              'p-3 rounded-xl mb-4',
              'backdrop-blur-md bg-white/5 border border-white/10',
            )}
          >
            <p className="text-xs text-white/50 italic">{exercise.notes}</p>
          </div>
        )}

        {/* Video embeds if exists */}
        {exercise.videos && exercise.videos.length > 0 && (
          <div
            className={cn(
              'rounded-2xl overflow-hidden',
              'backdrop-blur-xl bg-white/5 border border-white/10',
            )}
          >
            <button
              onClick={() => setIsVideosOpen(!isVideosOpen)}
              className={cn(
                'flex w-full items-center justify-between px-4 py-3',
                'text-sm font-medium text-white/70 hover:text-white/90 transition-colors',
              )}
            >
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-amber-400" />
                <span>Watch Tutorials ({exercise.videos.length})</span>
              </div>
              <motion.div
                animate={{ rotate: isVideosOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-white/40" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isVideosOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 px-4 pb-4">
                    {exercise.videos.map((video, idx) => {
                      // Extract YouTube video ID if it's a YouTube URL
                      const youtubeMatch = video.match(
                        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
                      )
                      const videoId = youtubeMatch?.[1]

                      if (!videoId) {
                        return (
                          <a
                            key={idx}
                            href={video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono text-amber-400 hover:text-amber-300 underline transition-colors block"
                          >
                            Video {idx + 1}
                          </a>
                        )
                      }
                      return (
                        <div
                          key={idx}
                          className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10"
                        >
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={`${exercise.name} - Video ${idx + 1}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                          />
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 mt-auto">
          <Link to="/training" className="block">
            <button
              className={cn(
                'w-2/3 h-14 rounded-2xl font-semibold text-base text-neutral-950',
                'backdrop-blur-md bg-yellow-500/90 border border-yellow-400/30',
                'transition-all duration-200',
                'hover:bg-emerald-500/30 hover:border-emerald-400/50',
                'active:scale-[0.98]',
                'flex items-center justify-center gap-2',
              )}
            >
              <Play
                size={20}
                fill="black"
                stroke="black"
                style={{ opacity: 0.8 }}
              />
              Begin Exercise
            </button>
          </Link>
        </div>
      </div>
    )
  },
)

ExerciseCard.displayName = 'ExerciseCard'

// ============================================
// MAIN PAGE
// ============================================

function TrainingDetailsPage() {
  const navigate = useNavigate()

  const {
    isWorkoutInProgress,
    activeSessionId,
    activeRoutineId,
    currentSetIndex,
    routines,
    exercises,
    completedSets,
    sessions,
  } = useAppStore(
    useShallow((state) => ({
      isWorkoutInProgress: state.isWorkoutInProgress,
      activeSessionId: state.activeSessionId,
      activeRoutineId: state.activeRoutineId,
      currentSetIndex: state.currentSetIndex,
      routines: state.routines,
      exercises: state.exercises,
      completedSets: state.completedSets,
      sessions: state.sessions,
    })),
  )

  // Get active routine and day
  const activeRoutine = useMemo(
    () => routines.find((r) => r.id === activeRoutineId),
    [routines, activeRoutineId],
  )

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId),
    [sessions, activeSessionId],
  )

  const activeDay = useMemo(
    () => activeRoutine?.days.find((d) => d.id === activeSession?.dayId),
    [activeRoutine, activeSession],
  )

  const plannedSets = useMemo(() => activeDay?.plannedSets ?? [], [activeDay])
  const currentPlannedSet = plannedSets[currentSetIndex] as
    | PlannedSet
    | undefined

  // Get current exercise with its planned sets
  const currentExerciseData: ExerciseWithSets | null = useMemo(() => {
    if (!currentPlannedSet) return null

    const exercise = exercises.find(
      (ex) => ex.id === currentPlannedSet.exerciseId,
    )
    if (!exercise) return null

    // Get all planned sets for this exercise
    const exercisePlannedSets = plannedSets.filter(
      (ps) => ps.exerciseId === currentPlannedSet.exerciseId,
    )

    // Count completed sets for this exercise in current session
    const completedCount = completedSets.filter(
      (cs) => cs.sessionId === activeSessionId && cs.exerciseId === exercise.id,
    ).length

    return {
      exercise,
      plannedSets: exercisePlannedSets,
      completedCount,
    }
  }, [
    currentPlannedSet,
    exercises,
    plannedSets,
    completedSets,
    activeSessionId,
  ])

  // Redirect if not in workout
  useEffect(() => {
    if (!isWorkoutInProgress) {
      navigate({ to: '/' })
    }
  }, [isWorkoutInProgress, navigate])

  // Guard
  if (!currentExerciseData) {
    return null
  }

  return (
    <PageLayout
      variant="glass"
      bottomSlot={<ExerciseCard data={currentExerciseData} />}
    />
  )
}
