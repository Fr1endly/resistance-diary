import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { ChevronRight, Dumbbell, Pencil, Plus, Trash2, X } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'

import type { Exercise, MuscleGroup, WorkoutRoutine } from '@/types'
import PageLayout from '@/components/ui/PageLayout'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { useToast } from '@/hooks/useToast'

export const Route = createFileRoute('/exercises')({
  component: Page,
})

// ============================================
// ZOD SCHEMAS
// ============================================

const muscleContributionSchema = z.object({
  muscleGroupId: z.string().min(1, 'Muscle group is required'),
  percentage: z.number().min(1).max(100),
})

const exerciseFormSchema = z.object({
  name: z.string().min(2, 'Exercise name must be at least 2 characters'),
  description: z.string().optional(),
  muscleContributions: z.array(muscleContributionSchema),
  notes: z.string().optional(),
})

type ExerciseFormValues = z.infer<typeof exerciseFormSchema>

// ============================================
// HELPERS
// ============================================

function getRoutinesUsingExercise(
  exerciseId: string,
  routines: Array<WorkoutRoutine>,
): Array<WorkoutRoutine> {
  return routines.filter((routine) =>
    routine.days.some((day) =>
      day.plannedSets.some((set) => set.exerciseId === exerciseId),
    ),
  )
}

// ============================================
// EXERCISE LIST
// ============================================

interface ExerciseListProps {
  exercises: Array<Exercise>
  muscleGroups: Array<MuscleGroup>
  onCreateNew: () => void
  onEdit: (exercise: Exercise) => void
  onDelete: (exercise: Exercise) => void
}

function ExerciseList({
  exercises,
  muscleGroups,
  onCreateNew,
  onEdit,
  onDelete,
}: ExerciseListProps) {
  const muscleMap = new Map(muscleGroups.map((mg) => [mg.id, mg.name]))

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
            Exercise Library
          </p>
          <h3 className="font-display text-2xl font-bold text-white">
            Exercises
          </h3>
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

      {/* Stats */}
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
            Total
          </div>
        </div>
        <div className="h-12 w-px bg-white/10" />
        <div className="text-center flex-1">
          <div className="text-3xl font-bold text-amber-400 font-mono">
            {muscleGroups.length}
          </div>
          <div className="text-xs text-white/40 uppercase tracking-wider mt-1">
            Muscle Groups
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-3 overflow-y-auto flex-1 -mx-1 px-1">
        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
          <Dumbbell size={12} />
          All Exercises
        </h4>

        {exercises.length === 0 ? (
          <EmptyState
            icon={<Dumbbell size={32} className="text-white/30" />}
            title="No exercises yet"
            description="Create your first exercise to start building your workout routines"
            action={{ label: 'Add Exercise', onClick: onCreateNew }}
          />
        ) : (
          exercises.map((exercise) => (
            <div
              key={exercise.id}
              className={cn(
                'rounded-2xl p-4',
                'backdrop-blur-xl bg-white/5 border border-white/10',
              )}
            >
              <div className="flex items-start gap-3 mb-2">
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full shrink-0',
                    'bg-amber-500/20 border border-amber-400/30',
                    'text-amber-400',
                  )}
                >
                  <Dumbbell size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-display text-lg text-white/90">
                    {exercise.name}
                  </h5>
                  {exercise.description && (
                    <p className="text-xs text-white/40 line-clamp-2">
                      {exercise.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEdit(exercise)}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      'text-white/30 hover:text-amber-400 hover:bg-amber-500/10',
                    )}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(exercise)}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      'text-white/30 hover:text-red-400 hover:bg-red-500/10',
                    )}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {exercise.muscleContributions.length > 0 && (
                <div className="flex flex-wrap gap-2 ml-13">
                  {exercise.muscleContributions.map((mc) => (
                    <div
                      key={mc.muscleGroupId}
                      className={cn(
                        'px-3 py-1.5 rounded-lg',
                        'bg-white/5 border border-white/10',
                        'text-xs font-mono text-white/50',
                      )}
                    >
                      {muscleMap.get(mc.muscleGroupId) || 'Unknown'}:{' '}
                      {mc.percentage}%
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Button */}
      <div className="pt-2">
        <button
          onClick={onCreateNew}
          className={cn(
            'w-full h-14 rounded-2xl font-semibold text-base',
            'backdrop-blur-md bg-amber-500/20 border border-amber-400/30',
            'text-amber-100 transition-all duration-200',
            'hover:bg-amber-500/30 hover:border-amber-400/50',
            'active:scale-[0.98]',
            'flex items-center justify-center gap-2',
          )}
        >
          <Plus size={20} />
          Create Exercise
        </button>
      </div>
    </div>
  )
}

// ============================================
// EXERCISE FORM
// ============================================

interface ExerciseFormProps {
  muscleGroups: Array<MuscleGroup>
  onSubmit: (exercise: Exercise) => void
  onCancel: () => void
  initialData?: Exercise
}

function ExerciseForm({
  muscleGroups,
  onSubmit,
  onCancel,
  initialData,
}: ExerciseFormProps) {
  const isEditing = !!initialData
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      muscleContributions: initialData?.muscleContributions || [],
      notes: initialData?.notes || '',
    },
    mode: 'onBlur',
  })

  const {
    fields: contributionFields,
    append: appendContribution,
    remove: removeContribution,
  } = useFieldArray({
    control: form.control,
    name: 'muscleContributions',
  })

  const handleSubmit = form.handleSubmit(async (data: ExerciseFormValues) => {
    setIsSubmitting(true)
    try {
      const exercise: Exercise = {
        id: initialData?.id || nanoid(),
        name: data.name,
        description: data.description || undefined,
        muscleContributions: data.muscleContributions,
        notes: data.notes || undefined,
      }
      // Simulate slight delay for UX feedback
      await new Promise((resolve) => setTimeout(resolve, 300))
      onSubmit(exercise)
    } finally {
      setIsSubmitting(false)
    }
  })

  const handleAddContribution = () => {
    appendContribution({ muscleGroupId: '', percentage: 50 })
  }

  const nameError = form.formState.errors.name?.message

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full h-full flex flex-col space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
            {isEditing ? 'Edit Exercise' : 'New Exercise'}
          </p>
          <h3 className="font-display text-2xl font-bold text-white">
            {isEditing ? initialData.name : 'Create Exercise'}
          </h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            'backdrop-blur-md bg-white/5 border border-white/10',
            'text-white/50 hover:text-white/80 transition-colors',
          )}
        >
          <X size={20} />
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 overflow-y-auto flex-1 -mx-1 px-1">
        {/* Name */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-white/70">
            Exercise Name
          </span>
          <input
            type="text"
            placeholder="e.g., Bench Press"
            className={cn(
              'w-full h-10 px-3 rounded-lg',
              'bg-white/5 border text-white placeholder:text-white/30',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
              nameError ? 'border-red-500/50' : 'border-white/10',
            )}
            {...form.register('name')}
          />
          {nameError && <p className="text-red-400 text-xs">{nameError}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-white/70">
            Description (optional)
          </span>
          <textarea
            placeholder="How to perform this exercise..."
            className={cn(
              'w-full px-3 py-2 rounded-lg min-h-20',
              'bg-white/5 border border-white/10 text-white placeholder:text-white/30',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
            )}
            {...form.register('description')}
          />
        </div>

        {/* Muscle Contributions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/70">
              Muscle Groups
            </span>
            <button
              type="button"
              onClick={handleAddContribution}
              className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          {contributionFields.length === 0 ? (
            <div
              className={cn(
                'rounded-xl p-4 text-center',
                'bg-white/5 border border-white/10 border-dashed',
              )}
            >
              <p className="text-white/40 text-sm">
                No muscle groups added yet
              </p>
            </div>
          ) : (
            contributionFields.map((field, index) => (
              <MuscleContributionInput
                key={field.id}
                form={form}
                muscleGroups={muscleGroups}
                index={index}
                onRemove={() => removeContribution(index)}
              />
            ))
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-white/70">
            Notes (optional)
          </span>
          <textarea
            placeholder="Any additional notes..."
            className={cn(
              'w-full px-3 py-2 rounded-lg min-h-16',
              'bg-white/5 border border-white/10 text-white placeholder:text-white/30',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
            )}
            {...form.register('notes')}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className={cn(
            'flex-1 h-12 rounded-2xl font-medium text-sm',
            'backdrop-blur-md bg-white/5 border border-white/10',
            'text-white/60 transition-all duration-200',
            'hover:bg-white/10 hover:text-white/80',
            'active:scale-[0.98]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'flex-1 h-12 rounded-2xl font-semibold text-base',
            'backdrop-blur-md bg-amber-500/20 border border-amber-400/30',
            'text-amber-100 transition-all duration-200',
            'hover:bg-amber-500/30 hover:border-amber-400/50',
            'active:scale-[0.98]',
            'flex items-center justify-center gap-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" />
              Saving...
            </>
          ) : (
            <>
              {isEditing ? 'Save Changes' : 'Create'}
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>
    </form>
  )
}

// ============================================
// MUSCLE CONTRIBUTION INPUT
// ============================================

function MuscleContributionInput({
  form,
  muscleGroups,
  index,
  onRemove,
}: {
  form: UseFormReturn<ExerciseFormValues>
  muscleGroups: Array<MuscleGroup>
  index: number
  onRemove: () => void
}) {
  const error =
    form.formState.errors.muscleContributions?.[index]?.muscleGroupId?.message

  return (
    <div className={cn('rounded-xl p-4', 'bg-white/5 border border-white/10')}>
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          <span className="text-xs font-medium text-white/50">
            Muscle Group
          </span>
          <Controller
            control={form.control}
            name={`muscleContributions.${index}.muscleGroupId`}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger hasError={!!error} onBlur={field.onBlur}>
                  <SelectValue placeholder="Select muscle..." />
                </SelectTrigger>
                <SelectContent>
                  {muscleGroups.map((mg) => (
                    <SelectItem key={mg.id} value={mg.id}>
                      {mg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        <div className="w-24 space-y-2">
          <span className="text-xs font-medium text-white/50">%</span>
          <input
            type="number"
            min={1}
            max={100}
            className={cn(
              'w-full h-10 px-3 rounded-lg',
              'bg-white/5 border border-white/10 text-white',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
            )}
            {...form.register(`muscleContributions.${index}.percentage`, {
              valueAsNumber: true,
            })}
          />
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="mt-6 p-2 text-white/30 hover:text-red-400 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}

// ============================================
// PAGE COMPONENT
// ============================================

function Page() {
  const toast = useToast()
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null)

  const {
    exercises,
    muscleGroups,
    routines,
    addExercise,
    updateExercise,
    removeExercise,
  } = useAppStore()

  const handleCreateNew = () => {
    setEditingExercise(null)
    setView('form')
  }

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise)
    setView('form')
  }

  const handleDelete = (exercise: Exercise) => {
    setDeleteTarget(exercise)
  }

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      removeExercise(deleteTarget.id)
      toast.success(`"${deleteTarget.name}" deleted`)
      setDeleteTarget(null)
    }
  }

  const handleSubmitExercise = (exercise: Exercise) => {
    if (editingExercise) {
      updateExercise(exercise.id, exercise)
      toast.success('Exercise updated successfully')
    } else {
      addExercise(exercise)
      toast.success('Exercise created successfully')
    }
    setEditingExercise(null)
    setView('list')
  }

  const handleCancel = () => {
    setEditingExercise(null)
    setView('list')
  }

  // Get routines using the delete target exercise
  const routinesUsingExercise = deleteTarget
    ? getRoutinesUsingExercise(deleteTarget.id, routines)
    : []

  const deleteWarning =
    routinesUsingExercise.length > 0
      ? `This exercise is used in ${routinesUsingExercise.length} routine${routinesUsingExercise.length > 1 ? 's' : ''}: ${routinesUsingExercise.map((r) => r.name).join(', ')}. Deleting it may cause issues with those routines.`
      : undefined

  return (
    <>
      <PageLayout
        variant="glass"
        bottomUpper={
          view === 'list' ? (
            <ExerciseList
              exercises={exercises}
              muscleGroups={muscleGroups}
              onCreateNew={handleCreateNew}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <ExerciseForm
              muscleGroups={muscleGroups}
              onSubmit={handleSubmitExercise}
              onCancel={handleCancel}
              initialData={editingExercise || undefined}
            />
          )
        }
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Exercise"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        warning={deleteWarning}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant={routinesUsingExercise.length > 0 ? 'warning' : 'danger'}
      />
    </>
  )
}
