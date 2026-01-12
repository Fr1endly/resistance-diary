import { z } from 'zod'

// Helper for optional number fields that might receive NaN from valueAsNumber or null
const optionalNumberSchema = z
  .union([z.number(), z.nan(), z.null(), z.undefined()])
  .catch(undefined)
  .transform((val) => (typeof val === 'number' && isNaN(val) ? undefined : val))
  .optional()

export const plannedSetSchema = z.object({
  id: z.string(),
  exerciseId: z.string().min(1, 'Exercise is required'),
  targetReps: z.number().min(1, 'At least 1 rep required'),
  targetWeight: optionalNumberSchema,
  restSeconds: optionalNumberSchema,
  order: z.number(),
})

export const workoutDaySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Day name is required'),
  plannedSets: z.array(plannedSetSchema).min(1, 'At least one set is required'),
  order: z.number().optional(),
})

export const workoutFormSchema = z.object({
  name: z.string().min(2, 'Routine name must be at least 2 characters'),
  description: z.string().optional(),
  days: z
    .array(workoutDaySchema)
    .min(1, 'At least one workout day is required'),
})

export type WorkoutFormValues = z.infer<typeof workoutFormSchema>
export type WorkoutDayFormValues = WorkoutFormValues['days'][number]
export type PlannedSetFormValues = WorkoutDayFormValues['plannedSets'][number]
