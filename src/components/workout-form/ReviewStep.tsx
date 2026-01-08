import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { Exercise } from '@/types'
import type { WorkoutFormValues } from '@/lib/schemas'
import { cn } from '@/lib/utils'

interface ReviewStepProps {
  formValues: WorkoutFormValues
  exercises: Array<Exercise>
  onBack: () => void
  onEditBasic: () => void
  onEditDay: (index: number) => void
}

export function ReviewStep({
  formValues,
  exercises,
  onBack,
  onEditBasic,
  onEditDay,
}: ReviewStepProps) {
  const exerciseMap = useMemo(() => {
    const map = new Map<string, string>()
    exercises.forEach((ex) => map.set(ex.id, ex.name))
    return map
  }, [exercises])

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-white mb-2">
          Review Your Routine
        </h2>
        <p className="text-white/50 text-sm">
          Review and create your workout routine
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
        {/* Basic Info */}
        <div
          className={cn('rounded-xl p-4', 'bg-white/5 border border-white/10')}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-display text-lg font-semibold text-white">
                {formValues.name}
              </h3>
              {formValues.description && (
                <p className="text-white/50 text-sm mt-1">
                  {formValues.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onEditBasic}
              className="text-sm text-white/50 hover:text-white/70 transition-colors"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Days */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
            Workout Days ({formValues.days.length})
          </h4>

          {formValues.days.map((day, dayIndex) => {
            // Group sets by exercise
            const exerciseGroups = day.plannedSets.reduce(
              (acc, ps) => {
                if (!acc[ps.exerciseId]) acc[ps.exerciseId] = []
                acc[ps.exerciseId]?.push(ps)
                return acc
              },
              {} as Record<string, typeof day.plannedSets | undefined>,
            )

            return (
              <div
                key={day.id}
                className={cn(
                  'rounded-xl p-4',
                  'bg-white/5 border border-white/10',
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        'bg-amber-500/20 border border-amber-400/30',
                        'text-amber-400 font-bold font-mono text-sm',
                      )}
                    >
                      {dayIndex + 1}
                    </div>
                    <h5 className="font-display text-white/90">{day.name}</h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditDay(dayIndex)}
                    className="text-sm text-white/50 hover:text-white/70 transition-colors"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-2 ml-11">
                  {Object.entries(exerciseGroups).map(([exerciseId, sets]) => {
                    if (!sets) return null
                    return (
                      <div key={exerciseId} className="text-sm">
                        <span className="text-white/80">
                          {exerciseMap.get(exerciseId) || 'Unknown'}
                        </span>
                        <span className="text-white/40 ml-2">
                          {sets.length} set{sets.length > 1 ? 's' : ''} ×{' '}
                          {sets[0].targetReps} reps
                          {sets[0].targetWeight &&
                            ` @ ${sets[0].targetWeight}kg`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-between pt-6 mt-auto border-t border-white/5 bg-zinc-950 z-10">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 flex items-center gap-1 text-white/50 hover:text-white/70 transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <button
          type="submit"
          className={cn(
            'px-4 py-2 rounded-xl flex items-center gap-1',
            'bg-amber-500/20 border border-amber-400/30 text-amber-100',
            'hover:bg-amber-500/30 transition-colors',
          )}
        >
          Create Routine
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
