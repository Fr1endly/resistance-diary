export interface RepGroup {
  reps: number
  weight: number
  order: number
}

export interface CompletedSet {
  id: string
  sessionId: string
  exerciseId: string
  plannedSetId?: string // optional link to original plan
  repGroups: Array<RepGroup>
  completedAt: Date
  notes?: string
}

export interface WorkoutSession {
  id: string
  routineId: string
  dayId: string
  startedAt: Date
  completedAt?: Date
  notes?: string
}
