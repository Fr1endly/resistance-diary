import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest'
import { useAppStore } from '@/store/useAppStore'
import { useVolumeChartData } from '@/hooks/useVolumeChartData'
import type {
  WorkoutRoutine,
  WorkoutDay,
  PlannedSet,
  WorkoutSession,
  CompletedSet,
  RepGroup,
  Exercise,
} from '@/types'

// ============================================================================
// Mock Data Factories
// ============================================================================

const createMockExercise = (overrides: Partial<Exercise> = {}): Exercise => ({
  id: `exercise-${Math.random().toString(36).slice(2, 9)}`,
  name: 'Bench Press',
  muscleContributions: [{ muscleGroupId: 'chest', percentage: 100 }],
  ...overrides,
})

const createMockPlannedSet = (
  overrides: Partial<PlannedSet> = {},
): PlannedSet => ({
  id: `ps-${Math.random().toString(36).slice(2, 9)}`,
  exerciseId: 'exercise-1',
  targetReps: 10,
  targetWeight: 100,
  restSeconds: 90,
  order: 0,
  ...overrides,
})

const createMockDay = (overrides: Partial<WorkoutDay> = {}): WorkoutDay => ({
  id: `day-${Math.random().toString(36).slice(2, 9)}`,
  name: 'Day A',
  order: 0,
  plannedSets: [],
  ...overrides,
})

const createMockRoutine = (
  overrides: Partial<WorkoutRoutine> = {},
): WorkoutRoutine => ({
  id: `routine-${Math.random().toString(36).slice(2, 9)}`,
  name: 'Test Routine',
  description: 'A test workout routine',
  days: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const createMockSession = (
  overrides: Partial<WorkoutSession> = {},
): WorkoutSession => ({
  id: `session-${Math.random().toString(36).slice(2, 9)}`,
  routineId: 'routine-1',
  dayId: 'day-1',
  startedAt: new Date(),
  ...overrides,
})

const createMockCompletedSet = (
  overrides: Partial<CompletedSet> = {},
): CompletedSet => ({
  id: `cs-${Math.random().toString(36).slice(2, 9)}`,
  sessionId: 'session-1',
  exerciseId: 'exercise-1',
  plannedSetId: 'ps-1',
  repGroups: [{ reps: 10, weight: 100, order: 0 }],
  completedAt: new Date(),
  ...overrides,
})

const createRepGroup = (reps: number, weight: number, order = 0): RepGroup => ({
  reps,
  weight,
  order,
})

// ============================================================================
// Test Setup
// ============================================================================

const setupCleanStore = () => {
  useAppStore.setState({
    // Workout slice
    routines: [],
    activeRoutineId: null,
    // Session slice
    sessions: [],
    completedSets: [],
    activeSessionId: null,
    isWorkoutInProgress: false,
    currentSetIndex: 0,
    // Exercise slice (seed with test exercises)
    exercises: [
      createMockExercise({ id: 'bench-press', name: 'Bench Press', muscleContributions: [{ muscleGroupId: 'chest', percentage: 100 }] }),
      createMockExercise({ id: 'squat', name: 'Squat', muscleContributions: [{ muscleGroupId: 'quadriceps', percentage: 60 }, { muscleGroupId: 'glutes', percentage: 40 }] }),
      createMockExercise({ id: 'deadlift', name: 'Deadlift', muscleContributions: [{ muscleGroupId: 'back', percentage: 50 }, { muscleGroupId: 'hamstrings', percentage: 50 }] }),
      createMockExercise({ id: 'overhead-press', name: 'Overhead Press', muscleContributions: [{ muscleGroupId: 'shoulders', percentage: 100 }] }),
      createMockExercise({ id: 'barbell-row', name: 'Barbell Row', muscleContributions: [{ muscleGroupId: 'back', percentage: 100 }] }),
    ],
    // Muscle slice
    muscleGroups: [
      { id: 'chest', name: 'Chest', category: 'push' },
      { id: 'back', name: 'Back', category: 'pull' },
      { id: 'shoulders', name: 'Shoulders', category: 'push' },
      { id: 'quadriceps', name: 'Quadriceps', category: 'legs' },
      { id: 'hamstrings', name: 'Hamstrings', category: 'legs' },
      { id: 'glutes', name: 'Glutes', category: 'legs' },
    ],
  })
}

// ============================================================================
// Integration Tests
// ============================================================================

describe('Workout Flow Integration', () => {
  beforeEach(() => {
    setupCleanStore()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ==========================================================================
  // Phase 1: Routine Creation
  // ==========================================================================

  describe('Phase 1: Routine Creation', () => {
    it('creates a complete routine with days and planned sets', () => {
      const { result } = renderHook(() => useAppStore())

      const routine = createMockRoutine({
        id: 'push-pull-legs',
        name: 'Push Pull Legs',
        description: '3-day split',
        days: [
          createMockDay({
            id: 'push-day',
            name: 'Push',
            order: 0,
            plannedSets: [
              createMockPlannedSet({ id: 'ps-1', exerciseId: 'bench-press', targetReps: 8, targetWeight: 80, order: 0 }),
              createMockPlannedSet({ id: 'ps-2', exerciseId: 'bench-press', targetReps: 8, targetWeight: 80, order: 1 }),
              createMockPlannedSet({ id: 'ps-3', exerciseId: 'overhead-press', targetReps: 10, targetWeight: 40, order: 2 }),
            ],
          }),
          createMockDay({
            id: 'pull-day',
            name: 'Pull',
            order: 1,
            plannedSets: [
              createMockPlannedSet({ id: 'ps-4', exerciseId: 'deadlift', targetReps: 5, targetWeight: 120, order: 0 }),
              createMockPlannedSet({ id: 'ps-5', exerciseId: 'barbell-row', targetReps: 8, targetWeight: 60, order: 1 }),
            ],
          }),
          createMockDay({
            id: 'legs-day',
            name: 'Legs',
            order: 2,
            plannedSets: [
              createMockPlannedSet({ id: 'ps-6', exerciseId: 'squat', targetReps: 5, targetWeight: 100, order: 0 }),
              createMockPlannedSet({ id: 'ps-7', exerciseId: 'squat', targetReps: 5, targetWeight: 100, order: 1 }),
            ],
          }),
        ],
      })

      act(() => {
        result.current.addRoutine(routine)
      })

      // Verify routine structure
      expect(result.current.routines).toHaveLength(1)
      const savedRoutine = result.current.routines[0]
      expect(savedRoutine.id).toBe('push-pull-legs')
      expect(savedRoutine.name).toBe('Push Pull Legs')
      expect(savedRoutine.days).toHaveLength(3)

      // Verify days
      expect(savedRoutine.days[0].name).toBe('Push')
      expect(savedRoutine.days[0].plannedSets).toHaveLength(3)
      expect(savedRoutine.days[1].name).toBe('Pull')
      expect(savedRoutine.days[1].plannedSets).toHaveLength(2)
      expect(savedRoutine.days[2].name).toBe('Legs')
      expect(savedRoutine.days[2].plannedSets).toHaveLength(2)

      // Verify planned sets link to exercises
      expect(savedRoutine.days[0].plannedSets[0].exerciseId).toBe('bench-press')
      expect(savedRoutine.days[0].plannedSets[0].targetReps).toBe(8)
      expect(savedRoutine.days[0].plannedSets[0].targetWeight).toBe(80)
    })

    it('preserves routine after multiple additions', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(createMockRoutine({ id: 'routine-1', name: 'Routine 1' }))
        result.current.addRoutine(createMockRoutine({ id: 'routine-2', name: 'Routine 2' }))
        result.current.addRoutine(createMockRoutine({ id: 'routine-3', name: 'Routine 3' }))
      })

      expect(result.current.routines).toHaveLength(3)
      expect(result.current.routines.map((r) => r.name)).toEqual([
        'Routine 1',
        'Routine 2',
        'Routine 3',
      ])
    })
  })

  // ==========================================================================
  // Phase 2: Routine Activation
  // ==========================================================================

  describe('Phase 2: Routine Activation', () => {
    it('activates a routine by setting activeRoutineId', () => {
      const { result } = renderHook(() => useAppStore())

      const routine = createMockRoutine({ id: 'my-routine' })

      act(() => {
        result.current.addRoutine(routine)
        result.current.setActiveRoutine('my-routine')
      })

      expect(result.current.activeRoutineId).toBe('my-routine')
    })

    it('can switch between routines', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(createMockRoutine({ id: 'routine-a' }))
        result.current.addRoutine(createMockRoutine({ id: 'routine-b' }))
        result.current.setActiveRoutine('routine-a')
      })

      expect(result.current.activeRoutineId).toBe('routine-a')

      act(() => {
        result.current.setActiveRoutine('routine-b')
      })

      expect(result.current.activeRoutineId).toBe('routine-b')
    })

    it('can deactivate routine by setting null', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(createMockRoutine({ id: 'routine-1' }))
        result.current.setActiveRoutine('routine-1')
      })

      expect(result.current.activeRoutineId).toBe('routine-1')

      act(() => {
        result.current.setActiveRoutine(null)
      })

      expect(result.current.activeRoutineId).toBeNull()
    })
  })

  // ==========================================================================
  // Phase 3: Session Lifecycle
  // ==========================================================================

  describe('Phase 3: Session Lifecycle', () => {
    it('starts a session linked to active routine and day', () => {
      const { result } = renderHook(() => useAppStore())

      const routine = createMockRoutine({
        id: 'routine-1',
        days: [createMockDay({ id: 'day-1', name: 'Day A' })],
      })

      act(() => {
        result.current.addRoutine(routine)
        result.current.setActiveRoutine('routine-1')
      })

      const session = createMockSession({
        id: 'session-1',
        routineId: 'routine-1',
        dayId: 'day-1',
      })

      act(() => {
        result.current.startSession(session)
      })

      // Verify session state
      expect(result.current.sessions).toHaveLength(1)
      expect(result.current.sessions[0].routineId).toBe('routine-1')
      expect(result.current.sessions[0].dayId).toBe('day-1')
      expect(result.current.sessions[0].startedAt).toBeDefined()
      expect(result.current.sessions[0].completedAt).toBeUndefined()

      // Verify workout-in-progress state
      expect(result.current.activeSessionId).toBe('session-1')
      expect(result.current.isWorkoutInProgress).toBe(true)
      expect(result.current.currentSetIndex).toBe(0)
    })

    it('resets currentSetIndex when starting a new session', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        useAppStore.setState({ currentSetIndex: 5 })
      })

      act(() => {
        result.current.startSession(createMockSession({ id: 'new-session' }))
      })

      expect(result.current.currentSetIndex).toBe(0)
    })
  })

  // ==========================================================================
  // Phase 4: Set Completion Flow
  // ==========================================================================

  describe('Phase 4: Set Completion Flow', () => {
    const setupActiveSession = () => {
      const routine = createMockRoutine({
        id: 'routine-1',
        days: [
          createMockDay({
            id: 'day-1',
            plannedSets: [
              createMockPlannedSet({ id: 'ps-1', exerciseId: 'bench-press', targetReps: 8, targetWeight: 80 }),
              createMockPlannedSet({ id: 'ps-2', exerciseId: 'bench-press', targetReps: 8, targetWeight: 80 }),
              createMockPlannedSet({ id: 'ps-3', exerciseId: 'squat', targetReps: 5, targetWeight: 100 }),
            ],
          }),
        ],
      })

      const session = createMockSession({
        id: 'session-1',
        routineId: 'routine-1',
        dayId: 'day-1',
      })

      return { routine, session }
    }

    it('adds completed sets linked to session and planned set', () => {
      const { result } = renderHook(() => useAppStore())
      const { routine, session } = setupActiveSession()

      act(() => {
        result.current.addRoutine(routine)
        result.current.setActiveRoutine('routine-1')
        result.current.startSession(session)
      })

      const completedSet = createMockCompletedSet({
        id: 'cs-1',
        sessionId: 'session-1',
        exerciseId: 'bench-press',
        plannedSetId: 'ps-1',
        repGroups: [createRepGroup(8, 80)],
      })

      act(() => {
        result.current.addCompletedSet(completedSet)
      })

      expect(result.current.completedSets).toHaveLength(1)
      expect(result.current.completedSets[0].sessionId).toBe('session-1')
      expect(result.current.completedSets[0].plannedSetId).toBe('ps-1')
      expect(result.current.completedSets[0].exerciseId).toBe('bench-press')
    })

    it('accumulates multiple rep groups in a completed set', () => {
      const { result } = renderHook(() => useAppStore())
      const { routine, session } = setupActiveSession()

      act(() => {
        result.current.addRoutine(routine)
        result.current.setActiveRoutine('routine-1')
        result.current.startSession(session)
      })

      // Complete a set with drop sets (multiple rep groups)
      const completedSet = createMockCompletedSet({
        id: 'cs-1',
        sessionId: 'session-1',
        exerciseId: 'bench-press',
        plannedSetId: 'ps-1',
        repGroups: [
          createRepGroup(8, 80, 0),  // Main set: 640kg volume
          createRepGroup(6, 60, 1),  // Drop set 1: 360kg volume
          createRepGroup(5, 40, 2),  // Drop set 2: 200kg volume
        ],
      })

      act(() => {
        result.current.addCompletedSet(completedSet)
      })

      expect(result.current.completedSets[0].repGroups).toHaveLength(3)
      
      // Total volume: 640 + 360 + 200 = 1200kg
      const totalVolume = result.current.completedSets[0].repGroups.reduce(
        (sum, rg) => sum + rg.reps * rg.weight,
        0,
      )
      expect(totalVolume).toBe(1200)
    })

    it('advances to next set with nextSet()', () => {
      const { result } = renderHook(() => useAppStore())
      const { routine, session } = setupActiveSession()

      act(() => {
        result.current.addRoutine(routine)
        result.current.setActiveRoutine('routine-1')
        result.current.startSession(session)
      })

      expect(result.current.currentSetIndex).toBe(0)

      act(() => {
        result.current.addCompletedSet(createMockCompletedSet({ id: 'cs-1', plannedSetId: 'ps-1' }))
        result.current.nextSet()
      })

      expect(result.current.currentSetIndex).toBe(1)

      act(() => {
        result.current.addCompletedSet(createMockCompletedSet({ id: 'cs-2', plannedSetId: 'ps-2' }))
        result.current.nextSet()
      })

      expect(result.current.currentSetIndex).toBe(2)
    })

    it('can go back to previous set', () => {
      const { result } = renderHook(() => useAppStore())
      const { routine, session } = setupActiveSession()

      act(() => {
        result.current.addRoutine(routine)
        result.current.setActiveRoutine('routine-1')
        result.current.startSession(session)
        result.current.nextSet()
        result.current.nextSet()
      })

      expect(result.current.currentSetIndex).toBe(2)

      act(() => {
        result.current.previousSet()
      })

      expect(result.current.currentSetIndex).toBe(1)
    })
  })

  // ==========================================================================
  // Phase 5: Session Completion
  // ==========================================================================

  describe('Phase 5: Session Completion', () => {
    it('completes session with timestamp', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T10:00:00Z'))

      const { result } = renderHook(() => useAppStore())

      const session = createMockSession({
        id: 'session-1',
        startedAt: new Date('2026-01-08T09:00:00Z'),
      })

      act(() => {
        result.current.startSession(session)
      })

      // Advance time to simulate workout duration
      vi.setSystemTime(new Date('2026-01-08T10:30:00Z'))

      act(() => {
        result.current.completeSession()
      })

      expect(result.current.sessions[0].completedAt).toEqual(new Date('2026-01-08T10:30:00Z'))
    })

    it('clears workout state on completion', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.startSession(createMockSession({ id: 'session-1' }))
        result.current.addCompletedSet(createMockCompletedSet({ sessionId: 'session-1' }))
        result.current.nextSet()
      })

      expect(result.current.activeSessionId).toBe('session-1')
      expect(result.current.isWorkoutInProgress).toBe(true)
      expect(result.current.currentSetIndex).toBe(1)

      act(() => {
        result.current.completeSession()
      })

      expect(result.current.activeSessionId).toBeNull()
      expect(result.current.isWorkoutInProgress).toBe(false)
      expect(result.current.currentSetIndex).toBe(0)
    })

    it('preserves completed sets after session completion', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.startSession(createMockSession({ id: 'session-1' }))
        result.current.addCompletedSet(createMockCompletedSet({ id: 'cs-1', sessionId: 'session-1' }))
        result.current.addCompletedSet(createMockCompletedSet({ id: 'cs-2', sessionId: 'session-1' }))
        result.current.addCompletedSet(createMockCompletedSet({ id: 'cs-3', sessionId: 'session-1' }))
        result.current.completeSession()
      })

      expect(result.current.completedSets).toHaveLength(3)
      expect(result.current.completedSets.every((cs) => cs.sessionId === 'session-1')).toBe(true)
    })
  })

  // ==========================================================================
  // Full Workflow End-to-End
  // ==========================================================================

  describe('Full Workflow: Create Routine → Complete Workout', () => {
    it('completes entire workflow from routine creation to session completion', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T09:00:00Z'))

      const { result } = renderHook(() => useAppStore())

      // ===== Step 1: Create routine =====
      const routine = createMockRoutine({
        id: 'ppl-routine',
        name: 'Push Pull Legs',
        days: [
          createMockDay({
            id: 'push-day',
            name: 'Push Day',
            order: 0,
            plannedSets: [
              createMockPlannedSet({ id: 'ps-1', exerciseId: 'bench-press', targetReps: 8, targetWeight: 80, order: 0 }),
              createMockPlannedSet({ id: 'ps-2', exerciseId: 'bench-press', targetReps: 8, targetWeight: 80, order: 1 }),
              createMockPlannedSet({ id: 'ps-3', exerciseId: 'overhead-press', targetReps: 10, targetWeight: 40, order: 2 }),
            ],
          }),
        ],
      })

      act(() => {
        result.current.addRoutine(routine)
      })

      expect(result.current.routines).toHaveLength(1)

      // ===== Step 2: Activate routine =====
      act(() => {
        result.current.setActiveRoutine('ppl-routine')
      })

      expect(result.current.activeRoutineId).toBe('ppl-routine')

      // ===== Step 3: Start session =====
      const session = createMockSession({
        id: 'workout-session-1',
        routineId: 'ppl-routine',
        dayId: 'push-day',
        startedAt: new Date(),
      })

      act(() => {
        result.current.startSession(session)
      })

      expect(result.current.isWorkoutInProgress).toBe(true)
      expect(result.current.activeSessionId).toBe('workout-session-1')
      expect(result.current.currentSetIndex).toBe(0)

      // ===== Step 4: Complete Set 1 (Bench Press) =====
      vi.setSystemTime(new Date('2026-01-08T09:05:00Z'))

      act(() => {
        result.current.addCompletedSet(
          createMockCompletedSet({
            id: 'cs-1',
            sessionId: 'workout-session-1',
            exerciseId: 'bench-press',
            plannedSetId: 'ps-1',
            repGroups: [createRepGroup(8, 80)], // 640kg
            completedAt: new Date(),
          }),
        )
        result.current.nextSet()
      })

      expect(result.current.completedSets).toHaveLength(1)
      expect(result.current.currentSetIndex).toBe(1)

      // ===== Step 5: Complete Set 2 (Bench Press) =====
      vi.setSystemTime(new Date('2026-01-08T09:10:00Z'))

      act(() => {
        result.current.addCompletedSet(
          createMockCompletedSet({
            id: 'cs-2',
            sessionId: 'workout-session-1',
            exerciseId: 'bench-press',
            plannedSetId: 'ps-2',
            repGroups: [createRepGroup(7, 80)], // 560kg (one rep less)
            completedAt: new Date(),
          }),
        )
        result.current.nextSet()
      })

      expect(result.current.completedSets).toHaveLength(2)
      expect(result.current.currentSetIndex).toBe(2)

      // ===== Step 6: Complete Set 3 (Overhead Press) =====
      vi.setSystemTime(new Date('2026-01-08T09:15:00Z'))

      act(() => {
        result.current.addCompletedSet(
          createMockCompletedSet({
            id: 'cs-3',
            sessionId: 'workout-session-1',
            exerciseId: 'overhead-press',
            plannedSetId: 'ps-3',
            repGroups: [createRepGroup(10, 40)], // 400kg
            completedAt: new Date(),
          }),
        )
      })

      expect(result.current.completedSets).toHaveLength(3)

      // ===== Step 7: Complete session =====
      vi.setSystemTime(new Date('2026-01-08T09:20:00Z'))

      act(() => {
        result.current.completeSession()
      })

      // Verify final state
      expect(result.current.isWorkoutInProgress).toBe(false)
      expect(result.current.activeSessionId).toBeNull()
      expect(result.current.currentSetIndex).toBe(0)

      // Session should have completedAt
      const completedSession = result.current.sessions[0]
      expect(completedSession.completedAt).toEqual(new Date('2026-01-08T09:20:00Z'))

      // All completed sets preserved
      expect(result.current.completedSets).toHaveLength(3)

      // Routine still active
      expect(result.current.activeRoutineId).toBe('ppl-routine')
    })

    it('tracks volume correctly across full workflow', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      const { result } = renderHook(() => useAppStore())

      // Create and activate routine
      const routine = createMockRoutine({
        id: 'strength-routine',
        days: [createMockDay({ id: 'day-1' })],
      })

      act(() => {
        result.current.addRoutine(routine)
        result.current.setActiveRoutine('strength-routine')
      })

      // Start session
      act(() => {
        result.current.startSession(
          createMockSession({
            id: 'session-1',
            routineId: 'strength-routine',
            dayId: 'day-1',
            startedAt: new Date(),
          }),
        )
      })

      // Complete multiple sets with varying volumes
      act(() => {
        // Set 1: 5 reps × 100kg = 500kg
        result.current.addCompletedSet(
          createMockCompletedSet({
            id: 'cs-1',
            sessionId: 'session-1',
            repGroups: [createRepGroup(5, 100)],
            completedAt: new Date(),
          }),
        )
        // Set 2: 5 reps × 100kg = 500kg
        result.current.addCompletedSet(
          createMockCompletedSet({
            id: 'cs-2',
            sessionId: 'session-1',
            repGroups: [createRepGroup(5, 100)],
            completedAt: new Date(),
          }),
        )
        // Set 3: 3 reps × 120kg = 360kg
        result.current.addCompletedSet(
          createMockCompletedSet({
            id: 'cs-3',
            sessionId: 'session-1',
            repGroups: [createRepGroup(3, 120)],
            completedAt: new Date(),
          }),
        )
        result.current.completeSession()
      })

      // Verify volume via useVolumeChartData hook
      const { result: volumeResult } = renderHook(() => useVolumeChartData(7))

      // Total: 500 + 500 + 360 = 1360kg
      expect(volumeResult.current.totalVolume).toBe(1360)
      expect(volumeResult.current.chartData).toHaveLength(1)
      expect(volumeResult.current.chartData[0]).toEqual({
        label: '2026-01-08',
        value: 1360,
      })
    })

    it('isolates sessions by routine for volume tracking', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      const { result } = renderHook(() => useAppStore())

      // Create two routines
      act(() => {
        result.current.addRoutine(createMockRoutine({ id: 'routine-a', days: [createMockDay({ id: 'day-a' })] }))
        result.current.addRoutine(createMockRoutine({ id: 'routine-b', days: [createMockDay({ id: 'day-b' })] }))
      })

      // Complete session for routine A
      act(() => {
        result.current.setActiveRoutine('routine-a')
        result.current.startSession(createMockSession({ id: 'session-a', routineId: 'routine-a', dayId: 'day-a', startedAt: new Date() }))
        result.current.addCompletedSet(createMockCompletedSet({ id: 'cs-a', sessionId: 'session-a', repGroups: [createRepGroup(10, 100)], completedAt: new Date() }))
        result.current.completeSession()
      })

      // Complete session for routine B
      act(() => {
        result.current.setActiveRoutine('routine-b')
        result.current.startSession(createMockSession({ id: 'session-b', routineId: 'routine-b', dayId: 'day-b', startedAt: new Date() }))
        result.current.addCompletedSet(createMockCompletedSet({ id: 'cs-b', sessionId: 'session-b', repGroups: [createRepGroup(10, 200)], completedAt: new Date() }))
        result.current.completeSession()
      })

      // Check volume for routine B (active)
      const { result: volumeB } = renderHook(() => useVolumeChartData(7))
      expect(volumeB.current.totalVolume).toBe(2000) // Only routine B

      // Switch to routine A
      act(() => {
        result.current.setActiveRoutine('routine-a')
      })

      // Re-render volume hook
      const { result: volumeA } = renderHook(() => useVolumeChartData(7))
      expect(volumeA.current.totalVolume).toBe(1000) // Only routine A
    })
  })

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('Edge Cases', () => {
    it('handles cancelling a session mid-workout', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(createMockRoutine({ id: 'routine-1', days: [createMockDay({ id: 'day-1' })] }))
        result.current.setActiveRoutine('routine-1')
        result.current.startSession(createMockSession({ id: 'session-1', routineId: 'routine-1', dayId: 'day-1' }))
        result.current.addCompletedSet(createMockCompletedSet({ id: 'cs-1', sessionId: 'session-1' }))
        result.current.addCompletedSet(createMockCompletedSet({ id: 'cs-2', sessionId: 'session-1' }))
      })

      expect(result.current.completedSets).toHaveLength(2)

      act(() => {
        result.current.cancelSession()
      })

      // Session removed, completed sets for that session removed
      expect(result.current.sessions).toHaveLength(0)
      expect(result.current.completedSets).toHaveLength(0)
      expect(result.current.isWorkoutInProgress).toBe(false)
      expect(result.current.activeSessionId).toBeNull()
    })

    it('preserves other sessions completed sets when cancelling', () => {
      const { result } = renderHook(() => useAppStore())

      // Complete a session first
      act(() => {
        result.current.startSession(createMockSession({ id: 'session-1' }))
        result.current.addCompletedSet(createMockCompletedSet({ id: 'cs-1', sessionId: 'session-1' }))
        result.current.completeSession()
      })

      // Start and cancel another session
      act(() => {
        result.current.startSession(createMockSession({ id: 'session-2' }))
        result.current.addCompletedSet(createMockCompletedSet({ id: 'cs-2', sessionId: 'session-2' }))
        result.current.cancelSession()
      })

      // First session's data preserved
      expect(result.current.sessions).toHaveLength(1)
      expect(result.current.sessions[0].id).toBe('session-1')
      expect(result.current.completedSets).toHaveLength(1)
      expect(result.current.completedSets[0].sessionId).toBe('session-1')
    })

    it('handles routine deletion while session in progress', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(createMockRoutine({ id: 'routine-1', days: [createMockDay({ id: 'day-1' })] }))
        result.current.setActiveRoutine('routine-1')
        result.current.startSession(createMockSession({ id: 'session-1', routineId: 'routine-1', dayId: 'day-1' }))
      })

      expect(result.current.isWorkoutInProgress).toBe(true)

      // Remove the routine (edge case - UI should prevent this, but store should handle it)
      act(() => {
        result.current.removeRoutine('routine-1')
      })

      expect(result.current.routines).toHaveLength(0)
      // Note: removeRoutine does NOT auto-clear activeRoutineId - this could be a future improvement
      // The UI prevents deleting active routines, so this is an edge case
      expect(result.current.activeRoutineId).toBe('routine-1') // Orphaned reference
      // Session still exists (orphaned, but data preserved)
      expect(result.current.sessions).toHaveLength(1)
    })

    it('handles updating a completed set', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.startSession(createMockSession({ id: 'session-1' }))
        result.current.addCompletedSet(
          createMockCompletedSet({
            id: 'cs-1',
            sessionId: 'session-1',
            repGroups: [createRepGroup(8, 80)],
          }),
        )
      })

      expect(result.current.completedSets[0].repGroups[0].reps).toBe(8)

      // User realizes they did 10 reps, not 8
      act(() => {
        result.current.updateCompletedSet('cs-1', {
          repGroups: [createRepGroup(10, 80)],
        })
      })

      expect(result.current.completedSets[0].repGroups[0].reps).toBe(10)
    })
  })
})
