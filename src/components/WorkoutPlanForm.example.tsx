/**
 * Example Usage of WorkoutPlanForm Component
 * 
 * This demonstrates how to use the multi-step WorkoutPlanForm
 * to create a new workout plan.
 */

import { WorkoutPlanForm } from './WorkoutPlanForm'
import useStore from '@/hooks/useStore'
import { addWorkoutPlan } from '@/lib/db'
import type { WorkoutPlan } from '@/types'

export function WorkoutPlanFormExample() {
  const { addWorkout } = useStore()

  const handleSubmit = async (data: Omit<WorkoutPlan, 'id' | 'history'>) => {
    try {
      // Create workout plan with temporary ID
      const newWorkout: WorkoutPlan = {
        ...data,
        id: Date.now(),
        history: []
      }

      // Add to IndexedDB
      const id = await addWorkoutPlan(newWorkout)

      // Add to Zustand store with the actual ID
      addWorkout({
        ...newWorkout,
        id: id as number,
      })

      console.log('Workout plan created successfully!', { id, data })
      // Navigate to another page or show success message
    } catch (error) {
      console.error('Failed to create workout plan:', error)
      // Show error message to user
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <WorkoutPlanForm onSubmit={handleSubmit} />
    </div>
  )
}

/**
 * Example with initial data (for editing):
 */
export function WorkoutPlanFormEditExample() {
  const existingWorkout: Partial<WorkoutPlan> = {
    name: "Push Pull Legs",
    description: "A 3-day split focusing on push, pull, and leg movements",
    days: [
      {
        id: 1,
        name: "Push Day",
        exercises: [
          {
            name: "Bench Press",
            sets: [
              { number: 1, reps: [10], completed: false },
              { number: 2, reps: [10], completed: false },
              { number: 3, reps: [10], completed: false },
            ]
          }
        ]
      }
    ]
  }

  const handleSubmit = async (data: Omit<WorkoutPlan, 'id' | 'history'>) => {
    // Handle update logic here
    console.log('Updated workout:', data)
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <WorkoutPlanForm 
        onSubmit={handleSubmit} 
        initialData={existingWorkout}
      />
    </div>
  )
}
