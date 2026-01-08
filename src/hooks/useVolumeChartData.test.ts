import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest'
import { useVolumeChartData } from './useVolumeChartData'
import { useAppStore } from '@/store/useAppStore'
import type { WorkoutSession, CompletedSet, RepGroup } from '@/types'

// ============================================================================
// Mock Helpers
// ============================================================================

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
  id: `set-${Math.random().toString(36).slice(2, 9)}`,
  sessionId: 'session-1',
  exerciseId: 'exercise-1',
  repGroups: [{ reps: 10, weight: 50, order: 0 }],
  completedAt: new Date(),
  ...overrides,
})

const createRepGroup = (reps: number, weight: number, order = 0): RepGroup => ({
  reps,
  weight,
  order,
})

const setupStore = (state: {
  activeRoutineId?: string | null
  sessions?: WorkoutSession[]
  completedSets?: CompletedSet[]
}) => {
  act(() => {
    useAppStore.setState({
      activeRoutineId: state.activeRoutineId ?? null,
      sessions: state.sessions ?? [],
      completedSets: state.completedSets ?? [],
    })
  })
}

// ============================================================================
// Tests
// ============================================================================

describe('useVolumeChartData', () => {
  beforeEach(() => {
    // Reset store before each test
    useAppStore.setState({
      activeRoutineId: null,
      sessions: [],
      completedSets: [],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ==========================================================================
  // Empty/No Data Scenarios
  // ==========================================================================

  describe('when no data', () => {
    it('returns empty result when no activeRoutineId', () => {
      setupStore({ activeRoutineId: null })

      const { result } = renderHook(() => useVolumeChartData())

      expect(result.current).toEqual({ chartData: [], totalVolume: 0 })
    })

    it('returns empty result when no sessions exist', () => {
      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [],
        completedSets: [],
      })

      const { result } = renderHook(() => useVolumeChartData())

      expect(result.current).toEqual({ chartData: [], totalVolume: 0 })
    })

    it('returns empty result when sessions do not match activeRoutineId', () => {
      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [createMockSession({ id: 'session-1', routineId: 'other-routine' })],
        completedSets: [createMockCompletedSet({ sessionId: 'session-1' })],
      })

      const { result } = renderHook(() => useVolumeChartData())

      expect(result.current).toEqual({ chartData: [], totalVolume: 0 })
    })

    it('returns empty result when sessions have no completed sets', () => {
      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [createMockSession({ id: 'session-1', routineId: 'routine-1' })],
        completedSets: [],
      })

      const { result } = renderHook(() => useVolumeChartData())

      expect(result.current).toEqual({ chartData: [], totalVolume: 0 })
    })
  })

  // ==========================================================================
  // Volume Calculation
  // ==========================================================================

  describe('volume calculation', () => {
    it('calculates volume as reps × weight for single rep group', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [createMockSession({ id: 'session-1', routineId: 'routine-1', startedAt: new Date() })],
        completedSets: [
          createMockCompletedSet({
            sessionId: 'session-1',
            repGroups: [createRepGroup(10, 50)], // 10 × 50 = 500
            completedAt: new Date(),
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData())

      expect(result.current.totalVolume).toBe(500)
    })

    it('sums volume across multiple rep groups in a set', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [createMockSession({ id: 'session-1', routineId: 'routine-1', startedAt: new Date() })],
        completedSets: [
          createMockCompletedSet({
            sessionId: 'session-1',
            repGroups: [
              createRepGroup(10, 50, 0), // 500
              createRepGroup(8, 60, 1),  // 480
              createRepGroup(6, 70, 2),  // 420
            ],
            completedAt: new Date(),
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData())

      expect(result.current.totalVolume).toBe(1400) // 500 + 480 + 420
    })

    it('sums volume across multiple sets', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [createMockSession({ id: 'session-1', routineId: 'routine-1', startedAt: new Date() })],
        completedSets: [
          createMockCompletedSet({
            id: 'set-1',
            sessionId: 'session-1',
            repGroups: [createRepGroup(10, 100)], // 1000
            completedAt: new Date(),
          }),
          createMockCompletedSet({
            id: 'set-2',
            sessionId: 'session-1',
            repGroups: [createRepGroup(8, 100)], // 800
            completedAt: new Date(),
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData())

      expect(result.current.totalVolume).toBe(1800)
    })

    it('handles zero reps (volume = 0)', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [createMockSession({ id: 'session-1', routineId: 'routine-1', startedAt: new Date() })],
        completedSets: [
          createMockCompletedSet({
            sessionId: 'session-1',
            repGroups: [createRepGroup(0, 100)],
            completedAt: new Date(),
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData())

      expect(result.current.totalVolume).toBe(0)
    })

    it('handles zero weight (volume = 0)', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [createMockSession({ id: 'session-1', routineId: 'routine-1', startedAt: new Date() })],
        completedSets: [
          createMockCompletedSet({
            sessionId: 'session-1',
            repGroups: [createRepGroup(10, 0)],
            completedAt: new Date(),
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData())

      expect(result.current.totalVolume).toBe(0)
    })

    it('handles decimal weights correctly', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [createMockSession({ id: 'session-1', routineId: 'routine-1', startedAt: new Date() })],
        completedSets: [
          createMockCompletedSet({
            sessionId: 'session-1',
            repGroups: [createRepGroup(10, 22.5)], // 225
            completedAt: new Date(),
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData())

      expect(result.current.totalVolume).toBe(225)
    })

    it('handles large numbers without overflow', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [createMockSession({ id: 'session-1', routineId: 'routine-1', startedAt: new Date() })],
        completedSets: [
          createMockCompletedSet({
            sessionId: 'session-1',
            repGroups: [createRepGroup(1000, 1000)], // 1,000,000
            completedAt: new Date(),
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData())

      expect(result.current.totalVolume).toBe(1_000_000)
    })

    it('handles empty repGroups array', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [createMockSession({ id: 'session-1', routineId: 'routine-1', startedAt: new Date() })],
        completedSets: [
          createMockCompletedSet({
            sessionId: 'session-1',
            repGroups: [],
            completedAt: new Date(),
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData())

      expect(result.current.totalVolume).toBe(0)
      expect(result.current.chartData).toHaveLength(1)
      expect(result.current.chartData[0].value).toBe(0)
    })
  })

  // ==========================================================================
  // Date Filtering (daysBack parameter)
  // ==========================================================================

  describe('date filtering', () => {
    it('uses default of 31 days', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      // Session 30 days ago (should be included)
      const includedDate = new Date('2025-12-09T12:00:00Z')
      // Session 32 days ago (should be excluded)
      const excludedDate = new Date('2025-12-07T12:00:00Z')

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [
          createMockSession({ id: 'session-included', routineId: 'routine-1', startedAt: includedDate }),
          createMockSession({ id: 'session-excluded', routineId: 'routine-1', startedAt: excludedDate }),
        ],
        completedSets: [
          createMockCompletedSet({
            id: 'set-included',
            sessionId: 'session-included',
            repGroups: [createRepGroup(10, 100)],
            completedAt: includedDate,
          }),
          createMockCompletedSet({
            id: 'set-excluded',
            sessionId: 'session-excluded',
            repGroups: [createRepGroup(10, 100)],
            completedAt: excludedDate,
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData()) // default 31 days

      expect(result.current.totalVolume).toBe(1000) // Only included session
    })

    it('respects custom daysBack parameter', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      // Session 5 days ago (should be included with daysBack=7)
      const includedDate = new Date('2026-01-03T12:00:00Z')
      // Session 10 days ago (should be excluded with daysBack=7)
      const excludedDate = new Date('2025-12-29T12:00:00Z')

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [
          createMockSession({ id: 'session-included', routineId: 'routine-1', startedAt: includedDate }),
          createMockSession({ id: 'session-excluded', routineId: 'routine-1', startedAt: excludedDate }),
        ],
        completedSets: [
          createMockCompletedSet({
            id: 'set-included',
            sessionId: 'session-included',
            repGroups: [createRepGroup(10, 100)],
            completedAt: includedDate,
          }),
          createMockCompletedSet({
            id: 'set-excluded',
            sessionId: 'session-excluded',
            repGroups: [createRepGroup(10, 100)],
            completedAt: excludedDate,
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData(7))

      expect(result.current.totalVolume).toBe(1000) // Only included session
    })

    it('includes session exactly at cutoff boundary', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      // Cutoff is Jan 1 12:00:00 (7 days back from Jan 8 12:00:00)
      // Session at exactly cutoff time should be included (>=)
      const boundaryDate = new Date('2026-01-01T12:00:00Z')

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [
          createMockSession({ id: 'session-1', routineId: 'routine-1', startedAt: boundaryDate }),
        ],
        completedSets: [
          createMockCompletedSet({
            sessionId: 'session-1',
            repGroups: [createRepGroup(10, 100)],
            completedAt: boundaryDate,
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData(7))

      expect(result.current.totalVolume).toBe(1000)
    })

    it('excludes session one millisecond before cutoff', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      // Cutoff with daysBack=7 from Jan 8 12:00 → Jan 1 12:00
      // Session at Jan 1 11:59:59.999 should be excluded
      const justBeforeCutoff = new Date('2026-01-01T11:59:59.999Z')

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [
          createMockSession({ id: 'session-1', routineId: 'routine-1', startedAt: justBeforeCutoff }),
        ],
        completedSets: [
          createMockCompletedSet({
            sessionId: 'session-1',
            repGroups: [createRepGroup(10, 100)],
            completedAt: justBeforeCutoff,
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData(7))

      expect(result.current.totalVolume).toBe(0)
    })

    it('handles month rollover correctly', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))

      // 30 days back from Jan 15 = Dec 16
      const decemberDate = new Date('2025-12-20T12:00:00Z')

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [
          createMockSession({ id: 'session-1', routineId: 'routine-1', startedAt: decemberDate }),
        ],
        completedSets: [
          createMockCompletedSet({
            sessionId: 'session-1',
            repGroups: [createRepGroup(10, 100)],
            completedAt: decemberDate,
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData(30))

      expect(result.current.totalVolume).toBe(1000)
      expect(result.current.chartData[0].label).toBe('2025-12-20')
    })

    it('handles year rollover correctly', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-05T12:00:00Z'))

      // 10 days back from Jan 5 = Dec 26, 2025
      const lastYearDate = new Date('2025-12-28T12:00:00Z')

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [
          createMockSession({ id: 'session-1', routineId: 'routine-1', startedAt: lastYearDate }),
        ],
        completedSets: [
          createMockCompletedSet({
            sessionId: 'session-1',
            repGroups: [createRepGroup(10, 100)],
            completedAt: lastYearDate,
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData(10))

      expect(result.current.totalVolume).toBe(1000)
      expect(result.current.chartData[0].label).toBe('2025-12-28')
    })
  })

  // ==========================================================================
  // Routine Filtering
  // ==========================================================================

  describe('routine filtering', () => {
    it('only includes sessions from activeRoutineId', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [
          createMockSession({ id: 'session-1', routineId: 'routine-1', startedAt: new Date() }),
          createMockSession({ id: 'session-2', routineId: 'routine-2', startedAt: new Date() }),
        ],
        completedSets: [
          createMockCompletedSet({
            id: 'set-1',
            sessionId: 'session-1',
            repGroups: [createRepGroup(10, 100)],
            completedAt: new Date(),
          }),
          createMockCompletedSet({
            id: 'set-2',
            sessionId: 'session-2',
            repGroups: [createRepGroup(10, 200)],
            completedAt: new Date(),
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData())

      expect(result.current.totalVolume).toBe(1000) // Only routine-1
    })

    it('excludes sessions from other routines even if in date range', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [
          createMockSession({ id: 'session-other', routineId: 'other-routine', startedAt: new Date() }),
        ],
        completedSets: [
          createMockCompletedSet({
            sessionId: 'session-other',
            repGroups: [createRepGroup(10, 100)],
            completedAt: new Date(),
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData())

      expect(result.current).toEqual({ chartData: [], totalVolume: 0 })
    })

    it('updates when activeRoutineId changes', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [
          createMockSession({ id: 'session-1', routineId: 'routine-1', startedAt: new Date() }),
          createMockSession({ id: 'session-2', routineId: 'routine-2', startedAt: new Date() }),
        ],
        completedSets: [
          createMockCompletedSet({
            id: 'set-1',
            sessionId: 'session-1',
            repGroups: [createRepGroup(10, 100)],
            completedAt: new Date(),
          }),
          createMockCompletedSet({
            id: 'set-2',
            sessionId: 'session-2',
            repGroups: [createRepGroup(10, 200)],
            completedAt: new Date(),
          }),
        ],
      })

      const { result, rerender } = renderHook(() => useVolumeChartData())

      expect(result.current.totalVolume).toBe(1000) // routine-1

      // Change active routine
      act(() => {
        useAppStore.setState({ activeRoutineId: 'routine-2' })
      })
      rerender()

      expect(result.current.totalVolume).toBe(2000) // routine-2
    })
  })

  // ==========================================================================
  // Aggregation & Sorting
  // ==========================================================================

  describe('aggregation and sorting', () => {
    it('aggregates multiple sets on the same day into single data point', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      const sameDay = new Date('2026-01-08T10:00:00Z')

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [createMockSession({ id: 'session-1', routineId: 'routine-1', startedAt: sameDay })],
        completedSets: [
          createMockCompletedSet({
            id: 'set-1',
            sessionId: 'session-1',
            repGroups: [createRepGroup(10, 100)], // 1000
            completedAt: new Date('2026-01-08T10:00:00Z'),
          }),
          createMockCompletedSet({
            id: 'set-2',
            sessionId: 'session-1',
            repGroups: [createRepGroup(10, 100)], // 1000
            completedAt: new Date('2026-01-08T14:00:00Z'),
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData())

      expect(result.current.chartData).toHaveLength(1)
      expect(result.current.chartData[0]).toEqual({
        label: '2026-01-08',
        value: 2000,
      })
    })

    it('creates separate data points for different days', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [
          createMockSession({ id: 'session-1', routineId: 'routine-1', startedAt: new Date('2026-01-06T10:00:00Z') }),
          createMockSession({ id: 'session-2', routineId: 'routine-1', startedAt: new Date('2026-01-08T10:00:00Z') }),
        ],
        completedSets: [
          createMockCompletedSet({
            id: 'set-1',
            sessionId: 'session-1',
            repGroups: [createRepGroup(10, 100)],
            completedAt: new Date('2026-01-06T10:00:00Z'),
          }),
          createMockCompletedSet({
            id: 'set-2',
            sessionId: 'session-2',
            repGroups: [createRepGroup(10, 200)],
            completedAt: new Date('2026-01-08T10:00:00Z'),
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData())

      expect(result.current.chartData).toHaveLength(2)
    })

    it('sorts chart data by date ascending', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [
          createMockSession({ id: 'session-1', routineId: 'routine-1', startedAt: new Date('2026-01-08T10:00:00Z') }),
          createMockSession({ id: 'session-2', routineId: 'routine-1', startedAt: new Date('2026-01-05T10:00:00Z') }),
          createMockSession({ id: 'session-3', routineId: 'routine-1', startedAt: new Date('2026-01-07T10:00:00Z') }),
        ],
        completedSets: [
          createMockCompletedSet({
            id: 'set-1',
            sessionId: 'session-1',
            repGroups: [createRepGroup(10, 100)],
            completedAt: new Date('2026-01-08T10:00:00Z'),
          }),
          createMockCompletedSet({
            id: 'set-2',
            sessionId: 'session-2',
            repGroups: [createRepGroup(10, 100)],
            completedAt: new Date('2026-01-05T10:00:00Z'),
          }),
          createMockCompletedSet({
            id: 'set-3',
            sessionId: 'session-3',
            repGroups: [createRepGroup(10, 100)],
            completedAt: new Date('2026-01-07T10:00:00Z'),
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData())

      expect(result.current.chartData.map((d) => d.label)).toEqual([
        '2026-01-05',
        '2026-01-07',
        '2026-01-08',
      ])
    })

    it('uses ISO date format (YYYY-MM-DD) for labels', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [createMockSession({ id: 'session-1', routineId: 'routine-1', startedAt: new Date() })],
        completedSets: [
          createMockCompletedSet({
            sessionId: 'session-1',
            repGroups: [createRepGroup(10, 100)],
            completedAt: new Date('2026-01-08T10:00:00Z'),
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData())

      expect(result.current.chartData[0].label).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('aggregates sets from multiple sessions on same day', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [
          createMockSession({ id: 'session-1', routineId: 'routine-1', startedAt: new Date('2026-01-08T08:00:00Z') }),
          createMockSession({ id: 'session-2', routineId: 'routine-1', startedAt: new Date('2026-01-08T18:00:00Z') }),
        ],
        completedSets: [
          createMockCompletedSet({
            id: 'set-1',
            sessionId: 'session-1',
            repGroups: [createRepGroup(10, 100)], // 1000
            completedAt: new Date('2026-01-08T08:30:00Z'),
          }),
          createMockCompletedSet({
            id: 'set-2',
            sessionId: 'session-2',
            repGroups: [createRepGroup(10, 100)], // 1000
            completedAt: new Date('2026-01-08T18:30:00Z'),
          }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData())

      expect(result.current.chartData).toHaveLength(1)
      expect(result.current.chartData[0].value).toBe(2000)
      expect(result.current.totalVolume).toBe(2000)
    })
  })

  // ==========================================================================
  // Complex Scenarios
  // ==========================================================================

  describe('complex scenarios', () => {
    it('handles a full week of varied training data', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      setupStore({
        activeRoutineId: 'routine-1',
        sessions: [
          createMockSession({ id: 'mon', routineId: 'routine-1', startedAt: new Date('2026-01-05T10:00:00Z') }),
          createMockSession({ id: 'wed', routineId: 'routine-1', startedAt: new Date('2026-01-07T10:00:00Z') }),
          createMockSession({ id: 'fri', routineId: 'routine-1', startedAt: new Date('2026-01-09T10:00:00Z') }), // future, but still valid
        ],
        completedSets: [
          // Monday: 3 sets of squats
          createMockCompletedSet({ id: 'mon-1', sessionId: 'mon', repGroups: [createRepGroup(5, 100)], completedAt: new Date('2026-01-05T10:00:00Z') }),
          createMockCompletedSet({ id: 'mon-2', sessionId: 'mon', repGroups: [createRepGroup(5, 100)], completedAt: new Date('2026-01-05T10:15:00Z') }),
          createMockCompletedSet({ id: 'mon-3', sessionId: 'mon', repGroups: [createRepGroup(5, 100)], completedAt: new Date('2026-01-05T10:30:00Z') }),
          // Wednesday: 2 sets of deadlifts
          createMockCompletedSet({ id: 'wed-1', sessionId: 'wed', repGroups: [createRepGroup(5, 150)], completedAt: new Date('2026-01-07T10:00:00Z') }),
          createMockCompletedSet({ id: 'wed-2', sessionId: 'wed', repGroups: [createRepGroup(5, 150)], completedAt: new Date('2026-01-07T10:15:00Z') }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData(7))

      // Monday: 3 × (5 × 100) = 1500
      // Wednesday: 2 × (5 × 150) = 1500
      expect(result.current.totalVolume).toBe(3000)
      expect(result.current.chartData).toHaveLength(2)
      expect(result.current.chartData[0]).toEqual({ label: '2026-01-05', value: 1500 })
      expect(result.current.chartData[1]).toEqual({ label: '2026-01-07', value: 1500 })
    })

    it('correctly filters mixed routine data', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-08T12:00:00Z'))

      setupStore({
        activeRoutineId: 'push-pull',
        sessions: [
          createMockSession({ id: 'pp-1', routineId: 'push-pull', startedAt: new Date('2026-01-06T10:00:00Z') }),
          createMockSession({ id: 'legs-1', routineId: 'legs', startedAt: new Date('2026-01-07T10:00:00Z') }),
          createMockSession({ id: 'pp-2', routineId: 'push-pull', startedAt: new Date('2026-01-08T10:00:00Z') }),
        ],
        completedSets: [
          createMockCompletedSet({ id: 'set-pp1', sessionId: 'pp-1', repGroups: [createRepGroup(10, 80)], completedAt: new Date('2026-01-06T10:00:00Z') }),
          createMockCompletedSet({ id: 'set-legs', sessionId: 'legs-1', repGroups: [createRepGroup(10, 200)], completedAt: new Date('2026-01-07T10:00:00Z') }),
          createMockCompletedSet({ id: 'set-pp2', sessionId: 'pp-2', repGroups: [createRepGroup(10, 80)], completedAt: new Date('2026-01-08T10:00:00Z') }),
        ],
      })

      const { result } = renderHook(() => useVolumeChartData())

      // Only push-pull sessions: 800 + 800 = 1600
      expect(result.current.totalVolume).toBe(1600)
      expect(result.current.chartData).toHaveLength(2)
    })
  })
})
