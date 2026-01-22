import { useMemo } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Download,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Dumbbell
} from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

import PageLayout from '@/components/ui/PageLayout'
import { useAppStore } from '@/store/useAppStore'
import { useToast } from '@/hooks/useToast'
import { decodeRoutine } from '@/lib/shareUtils'
import { cn } from '@/lib/utils'
import type { PlannedSet } from '@/types'

export const Route = createFileRoute('/workouts/import/$code')({
  component: ImportPage,
})

function ImportPage() {
  const { code } = Route.useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const { addRoutine, exercises } = useAppStore(
    useShallow((state) => ({
      addRoutine: state.addRoutine,
      exercises: state.exercises,
    }))
  )

  // Memoize exercise name lookup
  const exerciseNameMap = useMemo(() => {
    const map = new Map<string, string>()
    exercises.forEach((ex) => map.set(ex.id, ex.name))
    return map
  }, [exercises])

  // Decode the routine from the URL parameter
  const routine = useMemo(() => {
    if (!code) return null
    return decodeRoutine(code)
  }, [code])

  const handleImport = () => {
    if (routine) {
      addRoutine(routine)
      toast.success(`"${routine.name}" imported successfully!`)
      navigate({ to: '/workouts' })
    }
  }

  const handleCancel = () => {
    navigate({ to: '/workouts' })
  }

  if (!routine) {
    return (
      <PageLayout
        variant="glass"
        bottomSlot={
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
              <AlertCircle size={32} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-2">
              Invalid Import Link
            </h1>
            <p className="text-white/50 mb-8 max-w-xs">
              This sharing link appears to be broken or invalid. Please check the URL and try again.
            </p>
            <button
              onClick={handleCancel}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold',
                'bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all'
              )}
            >
              <ArrowLeft size={18} />
              Back to Workouts
            </button>
          </div>
        }
      />
    )
  }

  const totalSets = routine.days.reduce((sum, day) => sum + day.plannedSets.length, 0)

  return (
    <PageLayout
      variant="glass"
      bottomSlot={
        <div className="w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleCancel}
              className="p-2 -ml-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="font-display text-xl font-bold text-white">Import Routine</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>

          <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-6">
            {/* Preview Card */}
            <div className="bg-amber-500/10 border border-amber-400/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-white">{routine.name}</h2>
                  <p className="text-amber-400/60 text-sm">Previewing routine content</p>
                </div>
              </div>

              {routine.description && (
                <p className="text-white/60 text-sm leading-relaxed mb-6 italic">
                  "{routine.description}"
                </p>
              )}

              <div className="flex gap-6 pt-4 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-white/30 text-[10px] uppercase tracking-wider font-bold mb-1">Days</span>
                  <div className="flex items-center gap-2 text-white font-mono font-bold">
                    <Calendar size={14} className="text-amber-400" />
                    {routine.days.length}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-white/30 text-[10px] uppercase tracking-wider font-bold mb-1">Total Sets</span>
                  <div className="flex items-center gap-2 text-white font-mono font-bold">
                    <Dumbbell size={14} className="text-amber-400" />
                    {totalSets}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Preview */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider px-2">
                Routine Breakdown
              </h3>

              {routine.days.map((day, idx) => {
                const dayExerciseGroups = day.plannedSets.reduce((acc, ps) => {
                  if (!acc[ps.exerciseId]) acc[ps.exerciseId] = []
                  acc[ps.exerciseId].push(ps)
                  return acc
                }, {} as Record<string, PlannedSet[]>)

                return (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white font-mono">
                        {idx + 1}
                      </div>
                      <h4 className="font-display font-bold text-white">{day.name}</h4>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(dayExerciseGroups).map(([exId, sets]) => (
                        <div key={exId} className="border-l-2 border-white/5 pl-4 py-1">
                          <p className="text-sm font-bold text-white/80 mb-2">
                            {exerciseNameMap.get(exId) || 'Unknown Exercise'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {sets.map((set, sIdx) => (
                              <div key={sIdx} className="px-2 py-1 rounded-md bg-white/5 text-[10px] font-mono text-white/40">
                                {set.targetReps} reps {set.targetWeight ? `@ ${set.targetWeight}kg` : ''}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="h-20" /> {/* Bottom spacer for button */}
          </div>

          {/* Action Button */}
          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={handleImport}
              className={cn(
                'w-full h-16 rounded-2xl font-bold text-lg',
                'bg-amber-500 text-neutral-950 shadow-xl shadow-amber-500/20',
                'flex items-center justify-center gap-3 transition-all duration-200',
                'hover:bg-amber-400 hover:scale-[1.02] active:scale-[0.98]'
              )}
            >
              <Download size={22} />
              Import Routine
            </button>
          </div>
        </div>
      }
    />
  )
}
