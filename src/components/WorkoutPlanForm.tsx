import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { nanoid } from 'nanoid'

import type { PlannedSet, WorkoutRoutine } from '@/types'
import type { WorkoutFormValues } from '@/lib/schemas'
import { useAppStore } from '@/store/useAppStore'
import { workoutFormSchema } from '@/lib/schemas'
import { BasicInfoStep } from '@/components/workout-form/BasicInfoStep'
import { DayPlanStep } from '@/components/workout-form/DayPlanStep'
import { ReviewStep } from '@/components/workout-form/ReviewStep'

interface WorkoutPlanFormProps {
  onSubmit: (routine: WorkoutRoutine) => void
  onCancel?: () => void
  initialData?: Partial<WorkoutRoutine>
}

export function WorkoutPlanForm({
  onSubmit,
  onCancel,
  initialData,
}: WorkoutPlanFormProps) {
  const exercises = useAppStore((state) => state.exercises)
  const [step, setStep] = useState<'basic' | 'days' | 'summary'>('basic')
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with default values or existing data
  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      days: initialData?.days?.map((day: any) => ({
        id: day.id,
        name: day.name,
        order: day.order || 0,
        plannedSets: day.plannedSets.map((ps: any) => ({
          id: ps.id,
          exerciseId: ps.exerciseId,
          targetReps: ps.targetReps,
          targetWeight: ps.targetWeight,
          restSeconds: ps.restSeconds,
          order: ps.order,
        })),
      })) || [
          {
            id: nanoid(),
            name: 'Day 1',
            order: 0,
            plannedSets: [
              {
                id: nanoid(),
                exerciseId: '',
                targetReps: 10,
                targetWeight: undefined,
                restSeconds: 60,
                order: 0,
              },
            ],
          },
        ],
    },
    mode: 'onBlur',
  })

  const {
    fields: dayFields,
    append: appendDay,
    remove: removeDay,
  } = useFieldArray({
    control: form.control,
    name: 'days',
  })

  // Navigation handlers
  const handleBasicInfoNext = async () => {
    // Validate basic info only
    const valid = await form.trigger(['name', 'description'])
    if (valid) {
      setStep('days')
    }
  }

  const handleDayNext = async () => {
    // Validate current day
    const valid = await form.trigger(`days.${currentDayIndex}`)
    if (!valid) {
      console.log('Validation failed for day:', currentDayIndex)
      console.log('Current form errors:', form.formState.errors)
      return
    }

    if (currentDayIndex < dayFields.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1)
    } else {
      setStep('summary')
    }
  }

  const handleDayPrevious = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1)
    } else {
      setStep('basic')
    }
  }

  const handleAddDay = async () => {
    // Validate current day before adding new one
    const valid = await form.trigger(`days.${currentDayIndex}`)
    if (!valid) {
      console.log('Validation failed for day:', currentDayIndex)
      console.log('Current form errors:', form.formState.errors)
      return
    }

    appendDay({
      id: nanoid(),
      name: `Day ${dayFields.length + 1}`,
      order: dayFields.length,
      plannedSets: [
        {
          id: nanoid(),
          exerciseId: '',
          targetReps: 10,
          targetWeight: undefined,
          restSeconds: 60,
          order: 0,
        },
      ],
    })
    setCurrentDayIndex(dayFields.length)
  }

  const handleRemoveDay = () => {
    if (dayFields.length <= 1) return
    removeDay(currentDayIndex)
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1)
    }
  }

  const handleFinalSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true)
    try {
      const now = new Date()
      const routine: WorkoutRoutine = {
        id: initialData?.id || nanoid(),
        name: data.name,
        description: data.description || undefined,
        days: data.days.map((day: any, idx: number) => ({
          id: day.id,
          name: day.name,
          order: idx,
          plannedSets: day.plannedSets.map(
            (ps: any, psIdx: number) =>
              ({
                id: ps.id,
                exerciseId: ps.exerciseId,
                targetReps: ps.targetReps,
                targetWeight: ps.targetWeight,
                restSeconds: ps.restSeconds,
                order: psIdx,
              }) as PlannedSet,
          ),
        })),
        createdAt: initialData?.createdAt || now,
        updatedAt: now,
      }
      // Simulate slight delay for UX feedback
      await new Promise((resolve) => setTimeout(resolve, 300))
      onSubmit(routine)
    } finally {
      setIsSubmitting(false)
    }
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
        <DayPlanStep
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
        <ReviewStep
          formValues={formValues}
          exercises={exercises}
          isSubmitting={isSubmitting}
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
