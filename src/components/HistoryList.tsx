import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { format } from 'date-fns'
import { Dumbbell, Trophy } from 'lucide-react'
import type { CompletedSet } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export function HistoryList() {
    const { completedSets, exercises } = useAppStore(
        useShallow((state) => ({
            completedSets: state.completedSets,
            exercises: state.exercises,
        })),
    )

    const groupedSets = useMemo(() => {
        const groups: Record<string, Array<CompletedSet>> = {}

        // Sort sets by date descending
        const sortedSets = [...completedSets].sort((a, b) =>
            new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        )

        // Group by date
        sortedSets.forEach((set) => {
            const dateKey = new Date(set.completedAt).toDateString()
            groups[dateKey] ??= []
            groups[dateKey].push(set)
        })

        return groups
    }, [completedSets])

    const getExerciseName = (id: string) => {
        return exercises.find((e) => e.id === id)?.name || 'Unknown Exercise'
    }

    const getBestSet = (set: CompletedSet) => {
        // Find the set with the highest weight * reps volume
        const best = set.repGroups.reduce((prev, current) => {
            const prevVol = prev.weight * prev.reps
            const currVol = current.weight * current.reps
            return currVol > prevVol ? current : prev
        }, set.repGroups[0])

        return `${best.reps} × ${best.weight}kg`
    }

    if (completedSets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-white/30">
                <Dumbbell size={48} className="mb-4 opacity-50" />
                <p className="text-lg font-medium">No history yet</p>
                <p className="text-sm">Complete a workout to see it here</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-20">
            {Object.entries(groupedSets).map(([dateKey, sets]) => {
                const date = new Date(sets[0].completedAt)

                return (
                    <div key={dateKey} className="relative">
                        {/* Sticky Header */}
                        <div className="sticky top-0 z-10 -mx-1 px-1 mb-4">
                            <div className={cn(
                                "py-3 px-4 rounded-xl flex items-center justify-between",
                                "backdrop-blur-xl bg-white/5 border border-white/10",
                                "shadow-lg shadow-black/20"
                            )}>
                                <h3 className="font-display font-bold text-lg text-white">
                                    {format(date, 'EEEE, MMMM d')}
                                </h3>
                                <div className="text-xs font-mono text-amber-400/80 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                                    {sets.length} Sets Completed
                                </div>
                            </div>
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-2 px-4 mb-2 text-xs font-medium text-white/40 uppercase tracking-wider">
                            <div className="col-span-5">Exercise</div>
                            <div className="col-span-2 text-center">Sets</div>
                            <div className="col-span-3">Best Set</div>
                            <div className="col-span-2 text-right">Time</div>
                        </div>

                        <div className="space-y-1">
                            {sets.map((set) => (
                                <div
                                    key={set.id}
                                    className={cn(
                                        'grid grid-cols-12 gap-2 p-4 rounded-xl items-center',
                                        'bg-white/5 border border-white/5',
                                        'hover:bg-white/10 transition-colors'
                                    )}
                                >
                                    {/* Exercise */}
                                    <div className="col-span-5">
                                        <h4 className="font-medium text-white/90 truncate pr-2">
                                            {getExerciseName(set.exerciseId)}
                                        </h4>
                                    </div>

                                    {/* Sets Count */}
                                    <div className="col-span-2 flex justify-center">
                                        <span className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono text-white/70">
                                            {set.repGroups.length}
                                        </span>
                                    </div>

                                    {/* Best Set */}
                                    <div className="col-span-3 flex items-center gap-1.5 overflow-hidden">
                                        <Trophy size={10} className="text-amber-400 shrink-0" />
                                        <span className="text-xs font-mono text-amber-100 truncate">
                                            {getBestSet(set)}
                                        </span>
                                    </div>

                                    {/* Time */}
                                    <div className="col-span-2 text-right">
                                        <span className="text-xs text-white/40 font-mono">
                                            {format(new Date(set.completedAt), 'h:mm a')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
