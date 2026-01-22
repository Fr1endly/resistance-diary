import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check, ChevronDown, Dumbbell, Clock } from 'lucide-react'
import type { Exercise, PlannedSet } from '@/types'
import { cn } from '@/lib/utils'

interface WorkoutProgressProps {
    plannedSets: PlannedSet[]
    exercises: Exercise[]
    currentSetIndex: number
}

interface SetWithStatus extends PlannedSet {
    globalIndex: number
    status: 'completed' | 'current' | 'upcoming'
}

interface ExerciseGroup {
    exerciseId: string
    exercise: Exercise
    sets: SetWithStatus[]
    status: 'completed' | 'current' | 'upcoming'
}

export function WorkoutProgress({
    plannedSets,
    exercises,
    currentSetIndex,
}: WorkoutProgressProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const exerciseGroups = useMemo(() => {
        return plannedSets.reduce((acc, set, index) => {
            const status =
                index < currentSetIndex
                    ? 'completed'
                    : index === currentSetIndex
                        ? 'current'
                        : 'upcoming'

            const existingGroup = acc.find((g) => g.exerciseId === set.exerciseId)

            if (existingGroup) {
                existingGroup.sets.push({ ...set, globalIndex: index, status })
                // Update group status logic if needed
                if (status === 'current') existingGroup.status = 'current'
                else if (status === 'upcoming' && existingGroup.status === 'completed')
                    existingGroup.status = 'upcoming'
            } else {
                const exercise = exercises.find((e) => e.id === set.exerciseId)
                if (exercise) {
                    acc.push({
                        exerciseId: set.exerciseId,
                        exercise,
                        sets: [{ ...set, globalIndex: index, status }],
                        status: status === 'current' ? 'current' : status, // Initial status based on first set
                    })
                }
            }
            return acc
        }, [] as ExerciseGroup[])
    }, [plannedSets, exercises, currentSetIndex])

    const totalSets = plannedSets.length
    const completedSetsCount = currentSetIndex
    const progressPercent = Math.min(
        100,
        Math.max(0, (completedSetsCount / totalSets) * 100),
    )

    return (
        <div
            className={cn(
                'w-full rounded-2xl overflow-hidden',
                'backdrop-blur-xl bg-white/5 border border-white/10',
                'transition-all duration-300',
            )}
        >
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between group"
            >
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
                        <div
                            className="absolute inset-0 rounded-full border-2 border-amber-500 transition-all duration-500"
                            style={{
                                clipPath: `inset(0 ${100 - progressPercent}% 0 0)`, // Simple circular progress approx
                                transform: 'rotate(-90deg)',
                            }}
                        />
                        {currentSetIndex >= totalSets ? (
                            <Check size={16} className="text-emerald-400" />
                        ) : (
                            <Clock size={16} className="text-amber-400" />
                        )}
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Workout Overview
                        </h3>
                        <p className="text-xs text-white/50">
                            {completedSetsCount} / {totalSets} Sets Completed
                        </p>
                    </div>
                </div>
                <ChevronDown
                    className={cn(
                        'text-white/40 transition-transform duration-300 group-hover:text-white/80',
                        isExpanded && 'rotate-180',
                    )}
                />
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="px-4 pb-4 space-y-4">
                            <div className="h-px w-full bg-white/10 mb-4" />

                            {exerciseGroups.map((group, groupIndex) => {
                                const isGroupCompleted = group.sets.every(s => s.status === 'completed')
                                const isGroupCurrent = group.sets.some(s => s.status === 'current')

                                return (
                                    <div key={group.exerciseId + groupIndex} className="relative">
                                        {/* Exercise Header */}
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={cn(
                                                "w-1 h-full absolute left-1.5 top-8 bottom-0 bg-white/5 rounded-full",
                                                groupIndex === exerciseGroups.length - 1 && "hidden"
                                            )} />

                                            <div className={cn(
                                                "w-4 h-4 rounded-full border-2 flex items-center justify-center z-10",
                                                isGroupCompleted ? "bg-emerald-500 border-emerald-500" :
                                                    isGroupCurrent ? "bg-amber-500 border-amber-500" :
                                                        "bg-neutral-800 border-white/20"
                                            )}>
                                                {isGroupCompleted && <Check size={10} className="text-black" />}
                                            </div>

                                            <span className={cn(
                                                "text-sm font-semibold truncate",
                                                isGroupCompleted ? "text-emerald-400/80 line-through decoration-emerald-500/50" :
                                                    isGroupCurrent ? "text-amber-400" :
                                                        "text-white/60"
                                            )}>
                                                {group.exercise.name}
                                            </span>
                                        </div>

                                        {/* Sets Grid */}
                                        <div className="pl-7 grid grid-cols-4 gap-2">
                                            {group.sets.map((set, setIdx) => (
                                                <div
                                                    key={set.id}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center p-1.5 rounded-lg border text-[10px]",
                                                        set.status === 'completed'
                                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                            : set.status === 'current'
                                                                ? "bg-amber-500/20 border-amber-400/40 text-amber-100 shadow-[0_0_10px_rgba(251,191,36,0.1)]"
                                                                : "bg-white/5 border-white/5 text-white/30"
                                                    )}
                                                >
                                                    <span className="font-mono">{set.targetReps}</span>
                                                    <span className="opacity-50">reps</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
