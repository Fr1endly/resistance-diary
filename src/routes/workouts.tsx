import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Calendar, ChevronRight, Dumbbell, Pencil, Plus, Trash2 } from 'lucide-react'

import type { PlannedSet, WorkoutRoutine } from '@/types'
import PageLayout from '@/components/ui/PageLayout'
import Dialog from '@/components/ui/Dialog'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { WorkoutPlanForm } from '@/components/WorkoutPlanForm'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

export const Route = createFileRoute('/workouts')({
  component: WorkoutsPage,
})

// ============================================
// TYPES
// ============================================

interface RoutineCardProps {
  routine: WorkoutRoutine
  isActive: boolean
  onSelect: (routine: WorkoutRoutine) => void
  onEdit: (routine: WorkoutRoutine) => void
  onDelete: (routine: WorkoutRoutine) => void
}

// ============================================
// COMPONENTS
// ============================================

function RoutineCard({ routine, isActive, onSelect, onEdit, onDelete }: RoutineCardProps) {
  const totalExercises = useMemo(() => {
    const exerciseIds = new Set<string>()
    routine.days.forEach(day => {
      day.plannedSets.forEach(ps => exerciseIds.add(ps.exerciseId))
    })
    return exerciseIds.size
  }, [routine.days])

  const totalSets = useMemo(
    () => routine.days.reduce((sum, day) => sum + day.plannedSets.length, 0),
    [routine.days]
  )

  return (
    <div
      className={cn(
        "rounded-2xl p-4 transition-all duration-200 cursor-pointer",
        "backdrop-blur-xl border",
        isActive
          ? "bg-amber-500/10 border-amber-400/30"
          : "bg-white/5 border-white/10 hover:bg-white/10"
      )}
      onClick={() => onSelect(routine)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-display text-lg font-semibold text-white mb-1">
            {routine.name}
          </h3>
          {routine.description && (
            <p className="text-white/50 text-sm line-clamp-2">
              {routine.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(routine)
            }}
            className={cn(
              "p-2 rounded-lg transition-colors",
              "text-white/30 hover:text-amber-400 hover:bg-amber-500/10"
            )}
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(routine)
            }}
            className={cn(
              "p-2 rounded-lg transition-colors",
              "text-white/30 hover:text-red-400 hover:bg-red-500/10"
            )}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-white/50">
          <Calendar size={14} />
          <span>{routine.days.length} days</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/50">
          <Dumbbell size={14} />
          <span>{totalExercises} exercises</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/50">
          <span>{totalSets} sets</span>
        </div>
      </div>

      {isActive && (
        <div className="mt-3 pt-3 border-t border-amber-400/20">
          <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
            Active Routine
          </span>
        </div>
      )}
    </div>
  )
}

interface RoutineDetailDialogProps {
  routine: WorkoutRoutine | null
  exercises: Map<string, string>
  onActivate: (routine: WorkoutRoutine) => void
}

function RoutineDetailContent({ routine, exercises, onActivate }: RoutineDetailDialogProps) {
  if (!routine) return null

  return (
    <div className="space-y-6">
      {/* Description */}
      {routine.description && (
        <p className="text-white/60 leading-relaxed">
          {routine.description}
        </p>
      )}

      {/* Stats Overview */}
      <div className={cn(
        "flex items-center gap-4 py-4 px-5 rounded-2xl",
        "backdrop-blur-xl bg-white/5 border border-white/10"
      )}>
        <div className="text-center flex-1">
          <div className="text-3xl font-bold text-amber-400 font-mono">
            {routine.days.length}
          </div>
          <div className="text-xs text-white/40 uppercase tracking-wider mt-1">Days</div>
        </div>
        <div className="h-12 w-px bg-white/10" />
        <div className="text-center flex-1">
          <div className="text-3xl font-bold text-amber-400 font-mono">
            {routine.days.reduce((sum, day) => sum + day.plannedSets.length, 0)}
          </div>
          <div className="text-xs text-white/40 uppercase tracking-wider mt-1">Total Sets</div>
        </div>
      </div>

      {/* Days Breakdown */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
          Workout Plan
        </h4>
        {routine.days.map((day, idx) => {
          // Group sets by exercise
          const exerciseGroups = day.plannedSets.reduce((acc, ps) => {
            if (!acc[ps.exerciseId]) acc[ps.exerciseId] = []
            acc[ps.exerciseId].push(ps)
            return acc
          }, {} as Record<string, Array<PlannedSet>>)

          return (
            <div
              key={day.id}
              className={cn(
                "rounded-2xl p-4",
                "backdrop-blur-xl bg-white/5 border border-white/10"
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full",
                  "bg-amber-500/20 border border-amber-400/30",
                  "text-amber-400 font-bold font-mono text-sm"
                )}>
                  {idx + 1}
                </div>
                <h5 className="font-display text-lg text-white/90">{day.name}</h5>
              </div>

              <div className="space-y-3 ml-13">
                {Object.entries(exerciseGroups).map(([exerciseId, sets]) => (
                  <div
                    key={exerciseId}
                    className="border-l-2 border-white/10 pl-4 py-1"
                  >
                    <p className="text-white/80 font-medium mb-2">
                      {exercises.get(exerciseId) || exerciseId}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sets.map((set, setIdx) => (
                        <div
                          key={set.id}
                          className={cn(
                            "px-3 py-1.5 rounded-lg",
                            "bg-white/5 border border-white/10",
                            "text-xs font-mono text-white/50"
                          )}
                        >
                          Set {setIdx + 1}: {set.targetReps} reps
                          {set.targetWeight && ` @ ${set.targetWeight}kg`}
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

      {/* Action Button */}
      <div className="pt-2">
        <button
          onClick={() => onActivate(routine)}
          className={cn(
            "w-full h-14 rounded-2xl font-semibold text-base",
            "backdrop-blur-md bg-amber-500/20 border border-amber-400/30",
            "text-amber-100 transition-all duration-200",
            "hover:bg-amber-500/30 hover:border-amber-400/50",
            "active:scale-[0.98]",
            "flex items-center justify-center gap-2"
          )}
        >
          Select as Active Routine
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}

// ============================================
// MAIN PAGE
// ============================================

type ViewMode = 'list' | 'create' | 'edit'

function WorkoutsPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<ViewMode>('list')
  const [selectedRoutine, setSelectedRoutine] = useState<WorkoutRoutine | null>(null)
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WorkoutRoutine | null>(null)

  const {
    routines,
    exercises,
    activeRoutineId,
    addRoutine,
    updateRoutine,
    removeRoutine,
    toggleDialog,
  } = useAppStore()

  // Create exercise name lookup map
  const exerciseNameMap = useMemo(() => {
    const map = new Map<string, string>()
    exercises.forEach(ex => map.set(ex.id, ex.name))
    return map
  }, [exercises])

  // Reset selected routine when dialog closes
  useEffect(() => {
    return () => setSelectedRoutine(null)
  }, [])

  const handleRoutineSelect = (routine: WorkoutRoutine) => {
    setSelectedRoutine(routine)
    toggleDialog()
  }

  const handleEditRoutine = (routine: WorkoutRoutine) => {
    setEditingRoutine(routine)
    setView('edit')
  }

  const handleDeleteRoutine = (routine: WorkoutRoutine) => {
    setDeleteTarget(routine)
  }

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      removeRoutine(deleteTarget.id)
      if (selectedRoutine?.id === deleteTarget.id) {
        setSelectedRoutine(null)
      }
      setDeleteTarget(null)
    }
  }

  const handleActivateRoutine = (routine: WorkoutRoutine) => {
    useAppStore.setState({ activeRoutineId: routine.id })
    toggleDialog()
    navigate({ to: '/' })
  }

  const handleCreateRoutine = () => {
    setEditingRoutine(null)
    setView('create')
  }

  const handleFormSubmit = (routine: WorkoutRoutine) => {
    if (editingRoutine) {
      updateRoutine(routine.id, routine)
    } else {
      addRoutine(routine)
    }
    setEditingRoutine(null)
    setView('list')
  }

  const handleFormCancel = () => {
    setEditingRoutine(null)
    setView('list')
  }

  // CREATE/EDIT VIEW
  if (view === 'create' || view === 'edit') {
    return (
      <PageLayout
        variant="glass"
        bottomUpper={
          <div className="w-full h-full flex-1 flex flex-col">
            {/* Back Button */}
            <button
              onClick={handleFormCancel}
              className={cn(
                "self-start mb-4 flex items-center gap-2 px-3 py-2 rounded-xl",
                "text-white/50 hover:text-white/70 hover:bg-white/5",
                "transition-colors"
              )}
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Back</span>
            </button>

            {/* Form */}
            <WorkoutPlanForm
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              initialData={editingRoutine || undefined}
            />
          </div>
        }
      />
    )
  }

  // LIST VIEW
  return (
    <>
      <PageLayout
        variant="glass"
        bottomUpper={
          <div className="w-full h-full flex-1 flex flex-col ">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-white">
                  Workouts
                </h1>
                <p className="text-white/50 text-sm mt-1">
                  {routines.length} {routines.length === 1 ? 'routine' : 'routines'} available
                </p>
              </div>
              <button
                onClick={handleCreateRoutine}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  "backdrop-blur-md bg-amber-500/20 border border-amber-400/30",
                  "text-amber-100 transition-all duration-200",
                  "hover:bg-amber-500/30 hover:border-amber-400/50 hover:scale-105",
                  "active:scale-95"
                )}
              >
                <Plus size={24} />
              </button>
            </div>

            {/* Routine List */}
            {routines.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center mb-6",
                  "backdrop-blur-md bg-white/5 border border-white/10"
                )}>
                  <Dumbbell size={40} className="text-white/30" />
                </div>
                <p className="font-display text-white/40 text-center mb-2">
                  No routines yet
                </p>
                <p className="text-white/30 text-sm text-center mb-6">
                  Create your first workout routine to get started
                </p>
                <button
                  onClick={handleCreateRoutine}
                  className={cn(
                    "px-6 py-3 rounded-xl font-medium",
                    "backdrop-blur-md bg-amber-500/20 border border-amber-400/30",
                    "text-amber-100 transition-all duration-200",
                    "hover:bg-amber-500/30 hover:border-amber-400/50",
                    "active:scale-95"
                  )}
                >
                  Create Routine
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto -mx-1 px-1">
                <div className="flex flex-col gap-3 pb-4">
                  {routines.map((routine) => (
                    <RoutineCard
                      key={routine.id}
                      routine={routine}
                      isActive={activeRoutineId === routine.id}
                      onSelect={handleRoutineSelect}
                      onEdit={handleEditRoutine}
                      onDelete={handleDeleteRoutine}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        }
      />

      <Dialog title={selectedRoutine?.name}>
        <RoutineDetailContent
          routine={selectedRoutine}
          exercises={exerciseNameMap}
          onActivate={handleActivateRoutine}
        />
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Routine"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </>
  )
}
