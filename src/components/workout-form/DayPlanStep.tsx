import { Reorder, useDragControls } from 'motion/react'
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react'
import { Controller, useFieldArray } from 'react-hook-form'
import { nanoid } from 'nanoid'
import { useRef, useState, useCallback, memo } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import type { Exercise } from '@/types'
import type { WorkoutFormValues } from '@/lib/schemas'
import { cn } from '@/lib/utils'
import { GripVertical } from '@/components/icons'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DayPlanStepProps {
  form: UseFormReturn<WorkoutFormValues>
  exercises: Array<Exercise>
  dayIndex: number
  totalDays: number
  onNext: () => void
  onPrevious: () => void
  onAddDay: () => void
  onRemoveDay: () => void
}

const setValueAsOptionalNumber = (v: string | number | null | undefined) => {
  if (v === '' || v === null || v === undefined) return undefined
  const num = Number(v)
  return Number.isNaN(num) ? undefined : num
}

export function DayPlanStep({
  form,
  exercises,
  dayIndex,
  totalDays,
  onNext,
  onPrevious,
  onAddDay,
  onRemoveDay,
}: DayPlanStepProps) {
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: `days.${dayIndex}.plannedSets`,
  })

  // State for visual order during drag - Motion needs this to animate positions
  const [dragOrder, setDragOrder] = useState<typeof fields | null>(null)
  const isDraggingRef = useRef(false)

  // Use drag order during drag, otherwise use RHF fields
  const displayFields = dragOrder ?? fields

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true
    setDragOrder([...fields])
  }, [fields])

  const handleDragEnd = useCallback(() => {
    if (dragOrder && isDraggingRef.current) {
      // Check if order actually changed
      const orderChanged = fields.some((f, i) => f.id !== dragOrder[i]?.id)

      if (orderChanged) {
        // Replace entire array with new order
        replace(dragOrder)
      }
    }
    isDraggingRef.current = false
    setDragOrder(null)
  }, [fields, dragOrder, replace])

  const handleReorder = useCallback((newOrder: typeof fields) => {
    if (isDraggingRef.current) {
      setDragOrder(newOrder)
    }
  }, [])

  const dayErrors = form.formState.errors.days?.[dayIndex]

  // Helper to get formatted exercise name
  const getExerciseName = (id: string) => {
    return exercises.find((e) => e.id === id)?.name || 'Select Exercise'
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white mb-1">
            Day {dayIndex + 1} of {totalDays}
          </h2>
          <p className="text-white/50 text-xs">
            Configure exercises for this day
          </p>
        </div>
        {totalDays > 1 && (
          <button
            type="button"
            onClick={onRemoveDay}
            className="text-red-400 hover:text-red-300 transition-colors p-2"
            title="Remove Day"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          <label
            htmlFor={`day-${dayIndex}-name`}
            className="text-sm font-medium text-white/70"
          >
            Day Name
          </label>
          <input
            id={`day-${dayIndex}-name`}
            type="text"
            placeholder="e.g., Pull Day"
            className={cn(
              'w-full h-10 px-3 rounded-lg',
              'bg-white/5 border text-white placeholder:text-white/30',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
              dayErrors?.name ? 'border-red-500/50' : 'border-white/10',
            )}
            {...form.register(`days.${dayIndex}.name`)}
          />
          {dayErrors?.name && (
            <p className="text-red-400 text-xs">{dayErrors.name.message}</p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 custom-scrollbar">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-white/70">
            Planned Sets
          </span>
          {dayErrors?.plannedSets && (
            <span className="text-red-400 text-xs">
              {dayErrors.plannedSets.message}
            </span>
          )}
        </div>

        <Reorder.Group
          axis="y"
          values={displayFields}
          onReorder={handleReorder}
          className="space-y-3"
        >
          {displayFields.map((field) => {
            // Find actual index in RHF fields for form binding
            const rhfIndex = fields.findIndex((f) => f.id === field.id)
            return (
              <PlannedSetInput
                key={field.id}
                field={field}
                index={rhfIndex}
                form={form}
                dayIndex={dayIndex}
                exercises={exercises}
                onRemove={() => remove(rhfIndex)}
                canRemove={fields.length > 1}
                getExerciseName={getExerciseName}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            )
          })}
        </Reorder.Group>

        <button
          type="button"
          onClick={() =>
            append({
              id: nanoid(),
              exerciseId: '',
              targetReps: 10,
              targetWeight: undefined,
              restSeconds: 60,
              order: fields.length,
            })
          }
          className={cn(
            'w-full py-3 rounded-xl border border-dashed border-white/20',
            'text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5',
            'transition-all flex items-center justify-center gap-2 text-sm font-medium',
          )}
        >
          <Plus size={16} />
          Add Exercise Set
        </button>
      </div>

      <div className="flex items-start justify-between pt-4 mt-2 relative z-10 bg-gradient-to-t from-black/80 to-transparent -mx-4 px-4 pb-4">
        <button
          type="button"
          onClick={onPrevious}
          className="px-4 py-2 text-white/70 hover:text-white transition-colors flex items-center gap-1"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onAddDay}
            className={cn(
              'px-4 py-2 rounded-xl text-white/80 hover:text-white',
              'hover:bg-white/5 transition-colors border border-transparent hover:border-white/10',
            )}
          >
            + Add Another Day
          </button>
          <button
            type="button"
            onClick={onNext}
            className={cn(
              'px-4 py-2 rounded-xl flex items-center gap-1',
              'bg-amber-500/20 border border-amber-400/30 text-amber-100',
              'hover:bg-amber-500/30 transition-colors',
            )}
          >
            {dayIndex === totalDays - 1 ? 'Review Routine' : 'Next Day'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

const PlannedSetInput = memo(function PlannedSetInput({
  field,
  index,
  form,
  dayIndex,
  exercises,
  onRemove,
  canRemove,
  getExerciseName,
  onDragStart,
  onDragEnd,
}: {
  field: any
  index: number
  form: UseFormReturn<WorkoutFormValues>
  dayIndex: number
  exercises: Array<Exercise>
  onRemove: () => void
  canRemove: boolean
  getExerciseName: (id: string) => string
  onDragStart: () => void
  onDragEnd: () => void
}) {
  const controls = useDragControls()
  const error = form.formState.errors.days?.[dayIndex]?.plannedSets?.[index]

  return (
    <Reorder.Item
      value={field}
      dragListener={false}
      dragControls={controls}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      whileDrag={{ scale: 1.02, boxShadow: '0 8px 20px rgba(0,0,0,0.3)', zIndex: 50 }}
      className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
    >
      <div className="p-3 pl-2 flex gap-3">
        <div
          className="mt-2 text-white/30 hover:text-white/70 cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={(e) => controls.start(e)}
        >
          <GripVertical className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-3">
          {/* Exercise Selection */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-white/50 block">
              Exercise
            </span>
            <Controller
              control={form.control}
              name={`days.${dayIndex}.plannedSets.${index}.exerciseId`}
              render={({ field: { onChange, value } }) => (
                <Select onValueChange={onChange} value={value}>
                  <SelectTrigger className="w-full h-9 bg-white/5 border-white/10 text-white/90 text-sm">
                    <SelectValue placeholder="Select exercise">
                      {value ? getExerciseName(value) : 'Select exercise'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {exercises.map((exercise) => (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {error?.exerciseId && (
              <p className="text-red-400 text-[10px]">
                {error.exerciseId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Reps */}
            <div className="space-y-1">
              <label
                htmlFor={`d${dayIndex}-s${index}-reps`}
                className="text-xs font-medium text-white/50 block"
              >
                Reps
              </label>
              <input
                id={`d${dayIndex}-s${index}-reps`}
                type="number"
                placeholder="10"
                className={cn(
                  'w-full h-8 px-2 rounded-md text-sm',
                  'bg-white/5 border text-white placeholder:text-white/20',
                  'focus:outline-none focus:ring-1 focus:ring-amber-500/50',
                  error?.targetReps ? 'border-red-500/50' : 'border-white/10',
                )}
                {...form.register(
                  `days.${dayIndex}.plannedSets.${index}.targetReps`,
                  { valueAsNumber: true }
                )}
              />
            </div>

            {/* Weight */}
            <div className="space-y-1">
              <label
                htmlFor={`d${dayIndex}-s${index}-weight`}
                className="text-xs font-medium text-white/50 block"
              >
                kg (opt)
              </label>
              <input
                id={`d${dayIndex}-s${index}-weight`}
                type="number"
                placeholder="-"
                className={cn(
                  'w-full h-8 px-2 rounded-md text-sm',
                  'bg-white/5 border border-white/10 text-white placeholder:text-white/20',
                  'focus:outline-none focus:ring-1 focus:ring-amber-500/50',
                )}
                {...form.register(
                  `days.${dayIndex}.plannedSets.${index}.targetWeight`,
                  { setValueAs: setValueAsOptionalNumber }
                )}
              />
            </div>

            {/* Rest */}
            <div className="space-y-1">
              <label
                htmlFor={`d${dayIndex}-s${index}-rest`}
                className="text-xs font-medium text-white/50 block"
              >
                Rest (s)
              </label>
              <input
                id={`d${dayIndex}-s${index}-rest`}
                type="number"
                placeholder="60"
                className={cn(
                  'w-full h-8 px-2 rounded-md text-sm',
                  'bg-white/5 border border-white/10 text-white placeholder:text-white/20',
                  'focus:outline-none focus:ring-1 focus:ring-amber-500/50',
                )}
                {...form.register(
                  `days.${dayIndex}.plannedSets.${index}.restSeconds`,
                  { setValueAs: setValueAsOptionalNumber }
                )}
              />
            </div>
          </div>
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-white/20 hover:text-red-400 transition-colors self-start mt-2"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </Reorder.Item>
  )
})
