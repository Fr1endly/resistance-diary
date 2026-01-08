export interface PlannedSet {
  id: string
  exerciseId: string
  targetReps: number
  targetWeight?: number
  restSeconds?: number
  order?: number
}

export interface WorkoutDay {
  id: string
  name: string
  plannedSets: Array<PlannedSet>
  order?: number
}

export interface WorkoutRoutine {
  id: string
  name: string
  description?: string
  days: Array<WorkoutDay>
  createdAt: Date
  updatedAt: Date
}
