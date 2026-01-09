import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { CompletedSet, WorkoutSession } from '@/types'
import { useAppStore } from '@/store/useAppStore'

// ============================================
// TEST HELPERS
// ============================================

const createMockSession = (
  overrides?: Partial<WorkoutSession>,
): Omit<WorkoutSession, 'startedAt'> => ({
  id: 'session-1',
  routineId: 'routine-1',
  dayId: 'day-1',
  ...overrides,
})

const createMockCompletedSet = (
  overrides?: Partial<CompletedSet>,
): CompletedSet => ({
  id: 'cs-1',
  sessionId: 'session-1',
  exerciseId: 'exercise-1',
  repGroups: [{ reps: 10, weight: 50, order: 0 }],
  completedAt: new Date('2024-01-01T10:00:00'),
  ...overrides,
})

// ============================================
// TESTS
// ============================================

describe('sessionSlice', () => {
  beforeEach(() => {
    useAppStore.setState({
      sessions: [],
      completedSets: [],
      activeSessionId: null,
      currentDayIndex: 0,
      currentSetIndex: 0,
      isWorkoutInProgress: false,
    })
  })

  // ----------------------------------------
  // SESSION LIFECYCLE
  // ----------------------------------------

  describe('startSession', () => {
    it('creates session with startedAt timestamp', () => {
      const { result } = renderHook(() => useAppStore())
      const before = new Date()

      act(() => {
        result.current.startSession(createMockSession())
      })

      expect(result.current.sessions).toHaveLength(1)
      expect(
        result.current.sessions[0].startedAt.getTime(),
      ).toBeGreaterThanOrEqual(before.getTime())
    })

    it('sets isWorkoutInProgress to true', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.startSession(createMockSession())
      })

      expect(result.current.isWorkoutInProgress).toBe(true)
    })

    it('sets activeSessionId', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.startSession(createMockSession({ id: 'my-session' }))
      })

      expect(result.current.activeSessionId).toBe('my-session')
    })

    it('resets currentSetIndex to 0', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        useAppStore.setState({ currentSetIndex: 5 })
      })

      act(() => {
        result.current.startSession(createMockSession())
      })

      expect(result.current.currentSetIndex).toBe(0)
    })

    it('preserves routineId and dayId', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.startSession(
          createMockSession({ routineId: 'r1', dayId: 'd1' }),
        )
      })

      expect(result.current.sessions[0].routineId).toBe('r1')
      expect(result.current.sessions[0].dayId).toBe('d1')
    })
  })

  describe('completeSession', () => {
    it('sets completedAt timestamp', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.startSession(createMockSession())
      })

      const before = new Date()
      act(() => {
        result.current.completeSession()
      })

      expect(result.current.sessions[0].completedAt).toBeDefined()
      expect(
        result.current.sessions[0].completedAt!.getTime(),
      ).toBeGreaterThanOrEqual(before.getTime())
    })

    it('sets isWorkoutInProgress to false', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.startSession(createMockSession())
      })
      act(() => {
        result.current.completeSession()
      })

      expect(result.current.isWorkoutInProgress).toBe(false)
    })

    it('clears activeSessionId', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.startSession(createMockSession())
      })
      act(() => {
        result.current.completeSession()
      })

      expect(result.current.activeSessionId).toBeNull()
    })

    it('resets currentSetIndex to 0', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.startSession(createMockSession())
        useAppStore.setState({ currentSetIndex: 10 })
      })
      act(() => {
        result.current.completeSession()
      })

      expect(result.current.currentSetIndex).toBe(0)
    })

    it('accepts optional notes', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.startSession(createMockSession())
      })
      act(() => {
        result.current.completeSession('Great workout!')
      })

      expect(result.current.sessions[0].notes).toBe('Great workout!')
    })

    it('preserves completed sets', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.startSession(createMockSession())
        result.current.addCompletedSet(createMockCompletedSet())
      })
      act(() => {
        result.current.completeSession()
      })

      expect(result.current.completedSets).toHaveLength(1)
    })
  })

  describe('cancelSession', () => {
    it('removes the active session', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.startSession(createMockSession())
      })
      act(() => {
        result.current.cancelSession()
      })

      expect(result.current.sessions).toHaveLength(0)
    })

    it('removes completed sets for the cancelled session', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.startSession(createMockSession({ id: 'session-1' }))
        result.current.addCompletedSet(
          createMockCompletedSet({ id: 'cs-1', sessionId: 'session-1' }),
        )
        result.current.addCompletedSet(
          createMockCompletedSet({ id: 'cs-2', sessionId: 'session-1' }),
        )
      })
      act(() => {
        result.current.cancelSession()
      })

      expect(result.current.completedSets).toHaveLength(0)
    })

    it('does not affect other sessions completed sets', () => {
      const { result } = renderHook(() => useAppStore())

      // Pre-populate a completed set from another session
      act(() => {
        useAppStore.setState({
          completedSets: [
            createMockCompletedSet({
              id: 'cs-other',
              sessionId: 'other-session',
            }),
          ],
        })
      })

      act(() => {
        result.current.startSession(createMockSession({ id: 'session-1' }))
        result.current.addCompletedSet(
          createMockCompletedSet({ id: 'cs-1', sessionId: 'session-1' }),
        )
      })
      act(() => {
        result.current.cancelSession()
      })

      expect(result.current.completedSets).toHaveLength(1)
      expect(result.current.completedSets[0].id).toBe('cs-other')
    })

    it('sets isWorkoutInProgress to false', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.startSession(createMockSession())
      })
      act(() => {
        result.current.cancelSession()
      })

      expect(result.current.isWorkoutInProgress).toBe(false)
    })

    it('clears activeSessionId', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.startSession(createMockSession())
      })
      act(() => {
        result.current.cancelSession()
      })

      expect(result.current.activeSessionId).toBeNull()
    })

    it('resets currentSetIndex to 0', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.startSession(createMockSession())
        useAppStore.setState({ currentSetIndex: 5 })
      })
      act(() => {
        result.current.cancelSession()
      })

      expect(result.current.currentSetIndex).toBe(0)
    })
  })

  // ----------------------------------------
  // COMPLETED SET OPERATIONS
  // ----------------------------------------

  describe('addCompletedSet', () => {
    it('adds set to completedSets array', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addCompletedSet(createMockCompletedSet())
      })

      expect(result.current.completedSets).toHaveLength(1)
      expect(result.current.completedSets[0].id).toBe('cs-1')
    })

    it('appends multiple sets', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addCompletedSet(createMockCompletedSet({ id: 'cs-1' }))
        result.current.addCompletedSet(createMockCompletedSet({ id: 'cs-2' }))
        result.current.addCompletedSet(createMockCompletedSet({ id: 'cs-3' }))
      })

      expect(result.current.completedSets).toHaveLength(3)
    })

    it('preserves repGroups data', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addCompletedSet(
          createMockCompletedSet({
            repGroups: [
              { reps: 10, weight: 50, order: 0 },
              { reps: 8, weight: 55, order: 1 },
            ],
          }),
        )
      })

      expect(result.current.completedSets[0].repGroups).toHaveLength(2)
      expect(result.current.completedSets[0].repGroups[1].weight).toBe(55)
    })
  })

  describe('updateCompletedSet', () => {
    it('updates existing set by id', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addCompletedSet(createMockCompletedSet())
      })
      act(() => {
        result.current.updateCompletedSet('cs-1', {
          repGroups: [{ reps: 12, weight: 60, order: 0 }],
        })
      })

      expect(result.current.completedSets[0].repGroups[0].reps).toBe(12)
      expect(result.current.completedSets[0].repGroups[0].weight).toBe(60)
    })

    it('does nothing for non-existent id', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addCompletedSet(createMockCompletedSet())
      })
      act(() => {
        result.current.updateCompletedSet('fake-id', {
          repGroups: [{ reps: 99, weight: 99, order: 0 }],
        })
      })

      expect(result.current.completedSets[0].repGroups[0].reps).toBe(10)
    })

    it('only updates targeted set', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addCompletedSet(
          createMockCompletedSet({
            id: 'cs-1',
            repGroups: [{ reps: 10, weight: 50, order: 0 }],
          }),
        )
        result.current.addCompletedSet(
          createMockCompletedSet({
            id: 'cs-2',
            repGroups: [{ reps: 8, weight: 60, order: 0 }],
          }),
        )
      })
      act(() => {
        result.current.updateCompletedSet('cs-1', {
          repGroups: [{ reps: 15, weight: 70, order: 0 }],
        })
      })

      expect(result.current.completedSets[0].repGroups[0].reps).toBe(15)
      expect(result.current.completedSets[1].repGroups[0].reps).toBe(8)
    })
  })

  describe('removeCompletedSet', () => {
    it('removes set by id', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addCompletedSet(createMockCompletedSet())
      })
      act(() => {
        result.current.removeCompletedSet('cs-1')
      })

      expect(result.current.completedSets).toHaveLength(0)
    })

    it('does nothing for non-existent id', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addCompletedSet(createMockCompletedSet())
      })
      act(() => {
        result.current.removeCompletedSet('fake-id')
      })

      expect(result.current.completedSets).toHaveLength(1)
    })

    it('only removes targeted set', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addCompletedSet(createMockCompletedSet({ id: 'cs-1' }))
        result.current.addCompletedSet(createMockCompletedSet({ id: 'cs-2' }))
        result.current.addCompletedSet(createMockCompletedSet({ id: 'cs-3' }))
      })
      act(() => {
        result.current.removeCompletedSet('cs-2')
      })

      expect(result.current.completedSets).toHaveLength(2)
      expect(result.current.completedSets.map((cs) => cs.id)).toEqual([
        'cs-1',
        'cs-3',
      ])
    })
  })

  // ----------------------------------------
  // NAVIGATION
  // ----------------------------------------

  describe('setCurrentDayIndex', () => {
    it('sets currentDayIndex', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.setCurrentDayIndex(3)
      })

      expect(result.current.currentDayIndex).toBe(3)
    })
  })

  describe('setCurrentSetIndex', () => {
    it('sets currentSetIndex', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.setCurrentSetIndex(5)
      })

      expect(result.current.currentSetIndex).toBe(5)
    })
  })

  describe('nextSet', () => {
    it('increments currentSetIndex by 1', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.nextSet()
      })

      expect(result.current.currentSetIndex).toBe(1)
    })

    it('increments from any starting value', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        useAppStore.setState({ currentSetIndex: 5 })
      })

      act(() => {
        result.current.nextSet()
      })

      expect(result.current.currentSetIndex).toBe(6)
    })

    it('can be called multiple times', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.nextSet()
        result.current.nextSet()
        result.current.nextSet()
      })

      expect(result.current.currentSetIndex).toBe(3)
    })
  })

  describe('previousSet', () => {
    it('decrements currentSetIndex by 1', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        useAppStore.setState({ currentSetIndex: 3 })
      })

      act(() => {
        result.current.previousSet()
      })

      expect(result.current.currentSetIndex).toBe(2)
    })

    it('does not go below 0', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        useAppStore.setState({ currentSetIndex: 0 })
      })

      act(() => {
        result.current.previousSet()
      })

      expect(result.current.currentSetIndex).toBe(0)
    })

    it('stops at 0 after multiple calls', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        useAppStore.setState({ currentSetIndex: 2 })
      })

      act(() => {
        result.current.previousSet()
        result.current.previousSet()
        result.current.previousSet()
        result.current.previousSet()
      })

      expect(result.current.currentSetIndex).toBe(0)
    })
  })
})
