import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { PlannedSet, WorkoutDay, WorkoutRoutine } from '@/types'
import { useAppStore } from '@/store/useAppStore'

// ============================================
// TEST HELPERS
// ============================================

const createMockRoutine = (
  overrides?: Partial<WorkoutRoutine>,
): WorkoutRoutine => ({
  id: 'routine-1',
  name: 'Test Routine',
  days: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

const createMockDay = (overrides?: Partial<WorkoutDay>): WorkoutDay => ({
  id: 'day-1',
  name: 'Day 1',
  plannedSets: [],
  order: 0,
  ...overrides,
})

const createMockPlannedSet = (overrides?: Partial<PlannedSet>): PlannedSet => ({
  id: 'set-1',
  exerciseId: 'exercise-1',
  targetReps: 10,
  order: 0,
  ...overrides,
})

// ============================================
// TESTS
// ============================================

describe('workoutSlice', () => {
  beforeEach(() => {
    useAppStore.setState({
      routines: [],
      activeRoutineId: null,
    })
  })

  // ----------------------------------------
  // ROUTINE CRUD
  // ----------------------------------------

  describe('addRoutine', () => {
    it('adds a routine to empty list', () => {
      const { result } = renderHook(() => useAppStore())
      const routine = createMockRoutine()

      act(() => {
        result.current.addRoutine(routine)
      })

      expect(result.current.routines).toHaveLength(1)
      expect(result.current.routines[0].name).toBe('Test Routine')
    })

    it('appends routine to existing list', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(
          createMockRoutine({ id: 'r1', name: 'First' }),
        )
        result.current.addRoutine(
          createMockRoutine({ id: 'r2', name: 'Second' }),
        )
      })

      expect(result.current.routines).toHaveLength(2)
      expect(result.current.routines[1].name).toBe('Second')
    })
  })

  describe('updateRoutine', () => {
    it('updates routine properties', () => {
      const { result } = renderHook(() => useAppStore())
      const routine = createMockRoutine()

      act(() => {
        result.current.addRoutine(routine)
      })
      act(() => {
        result.current.updateRoutine('routine-1', { name: 'Updated Name' })
      })

      expect(result.current.routines[0].name).toBe('Updated Name')
    })

    it('sets updatedAt timestamp', () => {
      const { result } = renderHook(() => useAppStore())
      const originalDate = new Date('2024-01-01')
      const routine = createMockRoutine({ updatedAt: originalDate })

      act(() => {
        result.current.addRoutine(routine)
      })
      act(() => {
        result.current.updateRoutine('routine-1', { name: 'Updated' })
      })

      expect(result.current.routines[0].updatedAt.getTime()).toBeGreaterThan(
        originalDate.getTime(),
      )
    })

    it('does nothing for non-existent routine', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(createMockRoutine())
      })
      act(() => {
        result.current.updateRoutine('fake-id', { name: 'Should Not Apply' })
      })

      expect(result.current.routines[0].name).toBe('Test Routine')
    })

    it('preserves other routines unchanged', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(
          createMockRoutine({ id: 'r1', name: 'First' }),
        )
        result.current.addRoutine(
          createMockRoutine({ id: 'r2', name: 'Second' }),
        )
      })
      act(() => {
        result.current.updateRoutine('r1', { name: 'Updated First' })
      })

      expect(result.current.routines[0].name).toBe('Updated First')
      expect(result.current.routines[1].name).toBe('Second')
    })
  })

  describe('removeRoutine', () => {
    it('removes routine by id', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(createMockRoutine())
      })
      act(() => {
        result.current.removeRoutine('routine-1')
      })

      expect(result.current.routines).toHaveLength(0)
    })

    it('does nothing for non-existent id', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(createMockRoutine())
      })
      act(() => {
        result.current.removeRoutine('fake-id')
      })

      expect(result.current.routines).toHaveLength(1)
    })

    it('only removes targeted routine', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(createMockRoutine({ id: 'r1' }))
        result.current.addRoutine(createMockRoutine({ id: 'r2' }))
        result.current.addRoutine(createMockRoutine({ id: 'r3' }))
      })
      act(() => {
        result.current.removeRoutine('r2')
      })

      expect(result.current.routines).toHaveLength(2)
      expect(result.current.routines.map((r) => r.id)).toEqual(['r1', 'r3'])
    })
  })

  describe('setActiveRoutine', () => {
    it('sets activeRoutineId', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.setActiveRoutine('routine-1')
      })

      expect(result.current.activeRoutineId).toBe('routine-1')
    })

    it('can set to null', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.setActiveRoutine('routine-1')
      })
      act(() => {
        result.current.setActiveRoutine(null)
      })

      expect(result.current.activeRoutineId).toBeNull()
    })
  })

  // ----------------------------------------
  // DAY OPERATIONS
  // ----------------------------------------

  describe('addDayToRoutine', () => {
    it('adds day to specific routine', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(createMockRoutine())
      })
      act(() => {
        result.current.addDayToRoutine('routine-1', createMockDay())
      })

      expect(result.current.routines[0].days).toHaveLength(1)
      expect(result.current.routines[0].days[0].name).toBe('Day 1')
    })

    it('appends multiple days', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(createMockRoutine())
      })
      act(() => {
        result.current.addDayToRoutine(
          'routine-1',
          createMockDay({ id: 'd1', name: 'Push' }),
        )
        result.current.addDayToRoutine(
          'routine-1',
          createMockDay({ id: 'd2', name: 'Pull' }),
        )
      })

      expect(result.current.routines[0].days).toHaveLength(2)
      expect(result.current.routines[0].days[1].name).toBe('Pull')
    })

    it('updates routine updatedAt', () => {
      const { result } = renderHook(() => useAppStore())
      const originalDate = new Date('2024-01-01')

      act(() => {
        result.current.addRoutine(
          createMockRoutine({ updatedAt: originalDate }),
        )
      })
      act(() => {
        result.current.addDayToRoutine('routine-1', createMockDay())
      })

      expect(result.current.routines[0].updatedAt.getTime()).toBeGreaterThan(
        originalDate.getTime(),
      )
    })

    it('does not affect other routines', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(createMockRoutine({ id: 'r1' }))
        result.current.addRoutine(createMockRoutine({ id: 'r2' }))
      })
      act(() => {
        result.current.addDayToRoutine('r1', createMockDay())
      })

      expect(result.current.routines[0].days).toHaveLength(1)
      expect(result.current.routines[1].days).toHaveLength(0)
    })
  })

  describe('updateDay', () => {
    it('updates day within routine', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(
          createMockRoutine({ days: [createMockDay()] }),
        )
      })
      act(() => {
        result.current.updateDay('routine-1', 'day-1', { name: 'Leg Day' })
      })

      expect(result.current.routines[0].days[0].name).toBe('Leg Day')
    })

    it('only updates targeted day', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(
          createMockRoutine({
            days: [
              createMockDay({ id: 'd1', name: 'Push' }),
              createMockDay({ id: 'd2', name: 'Pull' }),
            ],
          }),
        )
      })
      act(() => {
        result.current.updateDay('routine-1', 'd1', { name: 'Updated Push' })
      })

      expect(result.current.routines[0].days[0].name).toBe('Updated Push')
      expect(result.current.routines[0].days[1].name).toBe('Pull')
    })
  })

  describe('removeDayFromRoutine', () => {
    it('removes day from routine', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(
          createMockRoutine({ days: [createMockDay()] }),
        )
      })
      act(() => {
        result.current.removeDayFromRoutine('routine-1', 'day-1')
      })

      expect(result.current.routines[0].days).toHaveLength(0)
    })

    it('only removes targeted day', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(
          createMockRoutine({
            days: [
              createMockDay({ id: 'd1' }),
              createMockDay({ id: 'd2' }),
              createMockDay({ id: 'd3' }),
            ],
          }),
        )
      })
      act(() => {
        result.current.removeDayFromRoutine('routine-1', 'd2')
      })

      expect(result.current.routines[0].days).toHaveLength(2)
      expect(result.current.routines[0].days.map((d) => d.id)).toEqual([
        'd1',
        'd3',
      ])
    })
  })

  // ----------------------------------------
  // PLANNED SET OPERATIONS
  // ----------------------------------------

  describe('addPlannedSetToDay', () => {
    it('adds planned set to day', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(
          createMockRoutine({ days: [createMockDay()] }),
        )
      })
      act(() => {
        result.current.addPlannedSetToDay(
          'routine-1',
          'day-1',
          createMockPlannedSet(),
        )
      })

      expect(result.current.routines[0].days[0].plannedSets).toHaveLength(1)
      expect(result.current.routines[0].days[0].plannedSets[0].targetReps).toBe(
        10,
      )
    })

    it('appends multiple sets', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(
          createMockRoutine({ days: [createMockDay()] }),
        )
      })
      act(() => {
        result.current.addPlannedSetToDay(
          'routine-1',
          'day-1',
          createMockPlannedSet({ id: 's1' }),
        )
        result.current.addPlannedSetToDay(
          'routine-1',
          'day-1',
          createMockPlannedSet({ id: 's2' }),
        )
        result.current.addPlannedSetToDay(
          'routine-1',
          'day-1',
          createMockPlannedSet({ id: 's3' }),
        )
      })

      expect(result.current.routines[0].days[0].plannedSets).toHaveLength(3)
    })
  })

  describe('removePlannedSetFromDay', () => {
    it('removes set from day', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(
          createMockRoutine({
            days: [createMockDay({ plannedSets: [createMockPlannedSet()] })],
          }),
        )
      })
      act(() => {
        result.current.removePlannedSetFromDay('routine-1', 'day-1', 'set-1')
      })

      expect(result.current.routines[0].days[0].plannedSets).toHaveLength(0)
    })

    it('only removes targeted set', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(
          createMockRoutine({
            days: [
              createMockDay({
                plannedSets: [
                  createMockPlannedSet({ id: 's1' }),
                  createMockPlannedSet({ id: 's2' }),
                  createMockPlannedSet({ id: 's3' }),
                ],
              }),
            ],
          }),
        )
      })
      act(() => {
        result.current.removePlannedSetFromDay('routine-1', 'day-1', 's2')
      })

      const sets = result.current.routines[0].days[0].plannedSets
      expect(sets).toHaveLength(2)
      expect(sets.map((s) => s.id)).toEqual(['s1', 's3'])
    })
  })

  describe('reorderPlannedSets', () => {
    it('reorders sets according to provided order', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(
          createMockRoutine({
            days: [
              createMockDay({
                plannedSets: [
                  createMockPlannedSet({ id: 's1', order: 0 }),
                  createMockPlannedSet({ id: 's2', order: 1 }),
                  createMockPlannedSet({ id: 's3', order: 2 }),
                ],
              }),
            ],
          }),
        )
      })
      act(() => {
        result.current.reorderPlannedSets('routine-1', 'day-1', [
          's3',
          's1',
          's2',
        ])
      })

      const sets = result.current.routines[0].days[0].plannedSets
      expect(sets[0].id).toBe('s3')
      expect(sets[1].id).toBe('s1')
      expect(sets[2].id).toBe('s2')
    })

    it('updates order property on each set', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(
          createMockRoutine({
            days: [
              createMockDay({
                plannedSets: [
                  createMockPlannedSet({ id: 's1', order: 0 }),
                  createMockPlannedSet({ id: 's2', order: 1 }),
                  createMockPlannedSet({ id: 's3', order: 2 }),
                ],
              }),
            ],
          }),
        )
      })
      act(() => {
        result.current.reorderPlannedSets('routine-1', 'day-1', [
          's3',
          's1',
          's2',
        ])
      })

      const sets = result.current.routines[0].days[0].plannedSets
      expect(sets[0].order).toBe(0)
      expect(sets[1].order).toBe(1)
      expect(sets[2].order).toBe(2)
    })

    it('skips missing set IDs', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(
          createMockRoutine({
            days: [
              createMockDay({
                plannedSets: [
                  createMockPlannedSet({ id: 's1' }),
                  createMockPlannedSet({ id: 's2' }),
                ],
              }),
            ],
          }),
        )
      })
      act(() => {
        result.current.reorderPlannedSets('routine-1', 'day-1', [
          's1',
          'fake-id',
          's2',
        ])
      })

      const sets = result.current.routines[0].days[0].plannedSets
      expect(sets).toHaveLength(2)
      expect(sets.map((s) => s.id)).toEqual(['s1', 's2'])
    })

    it('drops sets not in the ordered list', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(
          createMockRoutine({
            days: [
              createMockDay({
                plannedSets: [
                  createMockPlannedSet({ id: 's1' }),
                  createMockPlannedSet({ id: 's2' }),
                  createMockPlannedSet({ id: 's3' }),
                ],
              }),
            ],
          }),
        )
      })
      act(() => {
        // Only include s1 and s3, s2 should be dropped
        result.current.reorderPlannedSets('routine-1', 'day-1', ['s3', 's1'])
      })

      const sets = result.current.routines[0].days[0].plannedSets
      expect(sets).toHaveLength(2)
      expect(sets.map((s) => s.id)).toEqual(['s3', 's1'])
    })

    it('does not affect other days', () => {
      const { result } = renderHook(() => useAppStore())

      act(() => {
        result.current.addRoutine(
          createMockRoutine({
            days: [
              createMockDay({
                id: 'd1',
                plannedSets: [
                  createMockPlannedSet({ id: 's1' }),
                  createMockPlannedSet({ id: 's2' }),
                ],
              }),
              createMockDay({
                id: 'd2',
                plannedSets: [
                  createMockPlannedSet({ id: 's3' }),
                  createMockPlannedSet({ id: 's4' }),
                ],
              }),
            ],
          }),
        )
      })
      act(() => {
        result.current.reorderPlannedSets('routine-1', 'd1', ['s2', 's1'])
      })

      const day1Sets = result.current.routines[0].days[0].plannedSets
      const day2Sets = result.current.routines[0].days[1].plannedSets
      expect(day1Sets.map((s) => s.id)).toEqual(['s2', 's1'])
      expect(day2Sets.map((s) => s.id)).toEqual(['s3', 's4'])
    })
  })
})
