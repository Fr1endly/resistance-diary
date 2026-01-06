import { useState, useMemo } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import type { UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { nanoid } from "nanoid"
import { Plus, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Reorder, useDragControls } from "motion/react"

import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/useAppStore"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GripVertical } from "@/components/icons"
import type { WorkoutRoutine, Exercise } from "@/types"

// ============================================
// ZOD SCHEMAS
// ============================================

const plannedSetSchema = z.object({
  id: z.string(),
  exerciseId: z.string().min(1, "Exercise is required"),
  targetReps: z.number().min(1, "At least 1 rep required"),
  targetWeight: z.number().optional(),
  restSeconds: z.number().optional(),
  order: z.number(),
})

const workoutDaySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Day name is required"),
  plannedSets: z.array(plannedSetSchema).min(1, "At least one set is required"),
  order: z.number().optional(),
})

const formSchema = z.object({
  name: z.string().min(2, "Routine name must be at least 2 characters"),
  description: z.string().optional(),
  days: z.array(workoutDaySchema).min(1, "At least one workout day is required"),
})

type FormValues = z.infer<typeof formSchema>
type WorkoutDay = FormValues['days'][number]
type PlannedSet = WorkoutDay['plannedSets'][number]

// ============================================
// PROPS
// ============================================

interface WorkoutPlanFormProps {
  onSubmit: (routine: WorkoutRoutine) => void
  onCancel?: () => void
  initialData?: Partial<WorkoutRoutine>
}

// ============================================
// HELPERS
// ============================================

function createEmptyPlannedSet(order: number) {
  return {
    id: nanoid(),
    exerciseId: "",
    targetReps: 10,
    targetWeight: undefined,
    restSeconds: 90,
    order,
  }
}

function createEmptyDay(order: number) {
  return {
    id: nanoid(),
    name: `Day ${order + 1}`,
    order,
    plannedSets: [createEmptyPlannedSet(0)],
  }
}

// ============================================
// MAIN FORM COMPONENT
// ============================================

export function WorkoutPlanForm({ onSubmit, onCancel, initialData }: WorkoutPlanFormProps) {
  const [step, setStep] = useState<'basic' | 'days' | 'summary'>('basic')
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  
  const exercises = useAppStore(state => state.exercises)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      days: initialData?.days?.map(d => ({
        id: d.id,
        name: d.name,
        order: d.order,
        plannedSets: d.plannedSets.map(ps => ({
          id: ps.id,
          exerciseId: ps.exerciseId,
          targetReps: ps.targetReps,
          targetWeight: ps.targetWeight,
          restSeconds: ps.restSeconds,
          order: ps.order,
        }))
      })) || [],
    },
    mode: 'onBlur',
  })

  const { fields: dayFields, append: appendDay, remove: removeDay } = useFieldArray({
    control: form.control,
    name: "days",
  })

  const handleBasicInfoNext = async () => {
    const isValid = await form.trigger(['name'])
    if (isValid) {
      if (dayFields.length === 0) {
        appendDay(createEmptyDay(0))
      }
      setCurrentDayIndex(0)
      setStep('days')
    }
  }

  const handleDayNext = async () => {
    const isValid = await form.trigger([
      `days.${currentDayIndex}.name`,
      `days.${currentDayIndex}.plannedSets`,
    ])
    if (isValid) {
      if (currentDayIndex < dayFields.length - 1) {
        setCurrentDayIndex(currentDayIndex + 1)
      } else {
        setStep('summary')
      }
    }
  }

  const handleDayPrevious = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1)
    } else {
      setStep('basic')
    }
  }

  const handleAddDay = () => {
    const newIndex = dayFields.length
    appendDay(createEmptyDay(newIndex))
    setCurrentDayIndex(newIndex)
  }

  const handleRemoveDay = () => {
    removeDay(currentDayIndex)
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1)
    } else if (dayFields.length === 1) {
      setStep('basic')
    }
  }

  const handleFinalSubmit = form.handleSubmit((data: FormValues) => {
    const now = new Date()
    const routine: WorkoutRoutine = {
      id: initialData?.id || nanoid(),
      name: data.name,
      description: data.description || undefined,
      days: data.days.map((day: WorkoutDay, idx: number) => ({
        id: day.id,
        name: day.name,
        order: idx,
        plannedSets: day.plannedSets.map((ps: PlannedSet, psIdx: number) => ({
          id: ps.id,
          exerciseId: ps.exerciseId,
          targetReps: ps.targetReps,
          targetWeight: ps.targetWeight,
          restSeconds: ps.restSeconds,
          order: psIdx,
        })),
      })),
      createdAt: initialData?.createdAt || now,
      updatedAt: now,
    }
    onSubmit(routine)
  })

  const formValues = form.watch()

  return (
    <form onSubmit={handleFinalSubmit} className="h-full flex flex-col">
      {step === 'basic' && (
        <BasicInfoStep
          form={form}
          onNext={handleBasicInfoNext}
          onCancel={onCancel}
        />
      )}

      {step === 'days' && (
        <DayStep
          form={form}
          exercises={exercises}
          dayIndex={currentDayIndex}
          totalDays={dayFields.length}
          onNext={handleDayNext}
          onPrevious={handleDayPrevious}
          onAddDay={handleAddDay}
          onRemoveDay={handleRemoveDay}
        />
      )}

      {step === 'summary' && (
        <SummaryStep
          formValues={formValues}
          exercises={exercises}
          onBack={() => {
            setCurrentDayIndex(dayFields.length - 1)
            setStep('days')
          }}
          onEditBasic={() => setStep('basic')}
          onEditDay={(index: number) => {
            setCurrentDayIndex(index)
            setStep('days')
          }}
        />
      )}
    </form>
  )
}

// ============================================
// STEP 1: BASIC INFO
// ============================================

function BasicInfoStep({ 
  form, 
  onNext, 
  onCancel 
}: {
  form: UseFormReturn<FormValues>
  onNext: () => void
  onCancel?: () => void
}) {
  const nameError = form.formState.errors.name?.message

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-white mb-2">Create Workout Routine</h2>
        <p className="text-white/50 text-sm">Start by giving your routine a name</p>
      </div>

      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70">Routine Name</label>
          <input
            type="text"
            placeholder="e.g., Push Pull Legs"
            className={cn(
              "w-full h-10 px-3 rounded-lg",
              "bg-white/5 border text-white placeholder:text-white/30",
              "focus:outline-none focus:ring-2 focus:ring-amber-500/50",
              nameError ? "border-red-500/50" : "border-white/10"
            )}
            {...form.register('name')}
          />
          <p className="text-white/40 text-xs">Choose a memorable name for your workout routine</p>
          {nameError && <p className="text-red-400 text-xs">{nameError}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70">Description (optional)</label>
          <textarea
            placeholder="Describe your workout routine goals..."
            className={cn(
              "w-full px-3 py-2 rounded-lg min-h-25",
              "bg-white/5 border border-white/10 text-white placeholder:text-white/30",
              "focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            )}
            {...form.register('description')}
          />
        </div>
      </div>

      <div className="flex justify-between pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-white/50 hover:text-white/70 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          className={cn(
            "ml-auto px-4 py-2 rounded-xl flex items-center gap-1",
            "bg-amber-500/20 border border-amber-400/30 text-amber-100",
            "hover:bg-amber-500/30 transition-colors"
          )}
        >
          Next: Add Days
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ============================================
// STEP 2: DAY CONFIGURATION
// ============================================

function DayStep({
  form,
  exercises,
  dayIndex,
  totalDays,
  onNext,
  onPrevious,
  onAddDay,
  onRemoveDay,
}: {
  form: UseFormReturn<FormValues>
  exercises: Exercise[]
  dayIndex: number
  totalDays: number
  onNext: () => void
  onPrevious: () => void
  onAddDay: () => void
  onRemoveDay: () => void
}) {
  const { fields: setFields, append: appendSet, remove: removeSet, move: moveSet } = useFieldArray({
    control: form.control,
    name: `days.${dayIndex}.plannedSets`,
  })

  const dayNameError = form.formState.errors.days?.[dayIndex]?.name?.message
  const plannedSetsError = form.formState.errors.days?.[dayIndex]?.plannedSets?.message
    || form.formState.errors.days?.[dayIndex]?.plannedSets?.root?.message

  const handleReorder = (newOrder: typeof setFields) => {
    // Find what changed and use move to update form state
    const oldIds = setFields.map(f => f.id)
    const newIds = newOrder.map(f => f.id)
    
    // Find the item that moved
    for (let newIndex = 0; newIndex < newIds.length; newIndex++) {
      const oldIndex = oldIds.indexOf(newIds[newIndex])
      if (oldIndex !== newIndex) {
        moveSet(oldIndex, newIndex)
        return
      }
    }
  }

  const handleAddSet = () => {
    appendSet(createEmptyPlannedSet(setFields.length))
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-white mb-1">
            Day {dayIndex + 1} of {totalDays}
          </h2>
          <p className="text-white/50 text-sm">Configure exercises and sets</p>
        </div>
        {totalDays > 1 && (
          <button
            type="button"
            onClick={onRemoveDay}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={16} />
            Remove
          </button>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70">Day Name</label>
          <input
            type="text"
            placeholder="e.g., Push Day"
            className={cn(
              "w-full h-10 px-3 rounded-lg",
              "bg-white/5 border text-white placeholder:text-white/30",
              "focus:outline-none focus:ring-2 focus:ring-amber-500/50",
              dayNameError ? "border-red-500/50" : "border-white/10"
            )}
            {...form.register(`days.${dayIndex}.name`)}
          />
          {dayNameError && <p className="text-red-400 text-xs">{dayNameError}</p>}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white/70">Planned Sets</h3>
            <button
              type="button"
              onClick={handleAddSet}
              className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Plus size={16} />
              Add Set
            </button>
          </div>

          {plannedSetsError && (
            <p className="text-red-400 text-xs">{plannedSetsError}</p>
          )}

          <Reorder.Group
            axis="y"
            values={setFields}
            onReorder={handleReorder}
            className="space-y-3"
          >
            {setFields.map((field, setIndex) => (
              <PlannedSetInput
                key={field.id}
                field={field}
                form={form}
                exercises={exercises}
                dayIndex={dayIndex}
                setIndex={setIndex}
                onRemove={() => removeSet(setIndex)}
                canRemove={setFields.length > 1}
              />
            ))}
          </Reorder.Group>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onPrevious}
          className="px-4 py-2 flex items-center gap-1 text-white/50 hover:text-white/70 transition-colors"
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onAddDay}
            className="px-4 py-2 flex items-center gap-1 text-white/70 hover:text-white/90 transition-colors"
          >
            <Plus size={16} />
            Add Day
          </button>
          <button
            type="button"
            onClick={onNext}
            className={cn(
              "px-4 py-2 rounded-xl flex items-center gap-1",
              "bg-amber-500/20 border border-amber-400/30 text-amber-100",
              "hover:bg-amber-500/30 transition-colors"
            )}
          >
            {dayIndex < totalDays - 1 ? 'Next Day' : 'Review'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// PLANNED SET INPUT
// ============================================

interface FieldWithId {
  id: string;
  exerciseId: string;
  targetReps: number;
  targetWeight?: number;
  restSeconds?: number;
  order: number;
}

function PlannedSetInput({
  field,
  form,
  exercises,
  dayIndex,
  setIndex,
  onRemove,
  canRemove,
}: {
  field: FieldWithId
  form: UseFormReturn<FormValues>
  exercises: Exercise[]
  dayIndex: number
  setIndex: number
  onRemove: () => void
  canRemove: boolean
}) {
  const dragControls = useDragControls()
  const exerciseError = form.formState.errors.days?.[dayIndex]?.plannedSets?.[setIndex]?.exerciseId?.message

  return (
    <Reorder.Item
      value={field}
      dragListener={false}
      dragControls={dragControls}
      className={cn(
        "rounded-xl p-4 space-y-3",
        "bg-white/5 border border-white/10"
      )}
    >
      <div className="flex items-start gap-2">
        <div
          className="mt-6 p-1 cursor-grab active:cursor-grabbing text-white/30 hover:text-white/50 touch-none"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical size={20} />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-xs font-medium text-white/50">Exercise</label>
          <Controller
            control={form.control}
            name={`days.${dayIndex}.plannedSets.${setIndex}.exerciseId`}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  hasError={!!exerciseError}
                  onBlur={field.onBlur}
                >
                  <SelectValue placeholder="Select exercise..." />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map(ex => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {ex.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {exerciseError && <p className="text-red-400 text-xs">{exerciseError}</p>}
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="mt-6 p-2 text-white/30 hover:text-red-400 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-medium text-white/50">Target Reps</label>
          <input
            type="number"
            min={1}
            className={cn(
              "w-full h-10 px-3 rounded-lg",
              "bg-white/5 border border-white/10 text-white",
              "focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            )}
            {...form.register(`days.${dayIndex}.plannedSets.${setIndex}.targetReps`, {
              valueAsNumber: true
            })}
          />
        </div>

        <div className="flex-1 space-y-2">
          <label className="text-xs font-medium text-white/50">Weight (kg)</label>
          <input
            type="number"
            min={0}
            step={2.5}
            placeholder="Optional"
            className={cn(
              "w-full h-10 px-3 rounded-lg",
              "bg-white/5 border border-white/10 text-white placeholder:text-white/30",
              "focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            )}
            {...form.register(`days.${dayIndex}.plannedSets.${setIndex}.targetWeight`, {
              setValueAs: v => v === '' ? undefined : parseFloat(v)
            })}
          />
        </div>

        <div className="flex-1 space-y-2">
          <label className="text-xs font-medium text-white/50">Rest (sec)</label>
          <input
            type="number"
            min={0}
            step={15}
            placeholder="90"
            className={cn(
              "w-full h-10 px-3 rounded-lg",
              "bg-white/5 border border-white/10 text-white placeholder:text-white/30",
              "focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            )}
            {...form.register(`days.${dayIndex}.plannedSets.${setIndex}.restSeconds`, {
              setValueAs: v => v === '' ? undefined : parseInt(v)
            })}
          />
        </div>
      </div>
    </Reorder.Item>
  )
}

// ============================================
// STEP 3: SUMMARY
// ============================================

function SummaryStep({
  formValues,
  exercises,
  onBack,
  onEditBasic,
  onEditDay,
}: {
  formValues: FormValues
  exercises: Exercise[]
  onBack: () => void
  onEditBasic: () => void
  onEditDay: (index: number) => void
}) {
  const exerciseMap = useMemo(() => {
    const map = new Map<string, string>()
    exercises.forEach(ex => map.set(ex.id, ex.name))
    return map
  }, [exercises])

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-white mb-2">Review Your Routine</h2>
        <p className="text-white/50 text-sm">Review and create your workout routine</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
        {/* Basic Info */}
        <div className={cn(
          "rounded-xl p-4",
          "bg-white/5 border border-white/10"
        )}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-display text-lg font-semibold text-white">{formValues.name}</h3>
              {formValues.description && (
                <p className="text-white/50 text-sm mt-1">{formValues.description}</p>
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
            const exerciseGroups = day.plannedSets.reduce((acc, ps) => {
              if (!acc[ps.exerciseId]) acc[ps.exerciseId] = []
              acc[ps.exerciseId].push(ps)
              return acc
            }, {} as Record<string, typeof day.plannedSets>)

            return (
              <div
                key={day.id}
                className={cn(
                  "rounded-xl p-4",
                  "bg-white/5 border border-white/10"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      "bg-amber-500/20 border border-amber-400/30",
                      "text-amber-400 font-bold font-mono text-sm"
                    )}>
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
                  {Object.entries(exerciseGroups).map(([exerciseId, sets]) => (
                    <div key={exerciseId} className="text-sm">
                      <span className="text-white/80">{exerciseMap.get(exerciseId) || 'Unknown'}</span>
                      <span className="text-white/40 ml-2">
                        {sets.length} set{sets.length > 1 ? 's' : ''} × {sets[0].targetReps} reps
                        {sets[0].targetWeight && ` @ ${sets[0].targetWeight}kg`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-between pt-6">
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
            "px-4 py-2 rounded-xl flex items-center gap-1",
            "bg-amber-500/20 border border-amber-400/30 text-amber-100",
            "hover:bg-amber-500/30 transition-colors"
          )}
        >
          Create Routine
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
