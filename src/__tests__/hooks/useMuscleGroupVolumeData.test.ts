import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useMuscleGroupVolumeData } from '@/hooks/useMuscleGroupVolumeData'
import { useAppStore } from '@/store/useAppStore'
import type { CompletedSet, Exercise, MuscleGroup } from '@/types'

// Mock Data Helpers
const createMockMuscleGroup = (overrides: Partial<MuscleGroup> = {}): MuscleGroup => ({
    id: 'muscle-1',
    name: 'Test Muscle',
    category: 'push',
    ...overrides,
})

const createMockExercise = (overrides: Partial<Exercise> = {}): Exercise => ({
    id: 'exercise-1',
    name: 'Test Exercise',
    muscleContributions: [{ muscleGroupId: 'muscle-1', percentage: 100 }],
    ...overrides,
})

const createMockCompletedSet = (overrides: Partial<CompletedSet> = {}): CompletedSet => ({
    id: 'set-1',
    exerciseId: 'exercise-1',
    sessionId: 'session-1',
    plannedSetId: 'plan-1',
    completedAt: new Date(),
    repGroups: [{ reps: 10, weight: 100, order: 0 }], // 1000 volume
    ...overrides,
})

describe('useMuscleGroupVolumeData', () => {
    beforeEach(() => {
        // Reset store state before each test
        useAppStore.setState({
            completedSets: [],
            exercises: [],
            muscleGroups: [],
        })

        // Reset time to a known value
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('calculates total volume correctly for a single exercise', () => {
        const muscle = createMockMuscleGroup({ id: 'chest', name: 'Chest' })
        const exercise = createMockExercise({
            id: 'bench',
            muscleContributions: [{ muscleGroupId: 'chest', percentage: 100 }],
        })
        const set = createMockCompletedSet({
            exerciseId: 'bench',
            repGroups: [{ reps: 10, weight: 100, order: 0 }], // 1000 volume
            completedAt: new Date(),
        })

        useAppStore.setState({
            muscleGroups: [muscle],
            exercises: [exercise],
            completedSets: [set],
        })

        const { result } = renderHook(() => useMuscleGroupVolumeData())

        expect(result.current.totalVolume).toBe(1000)
        expect(result.current.chartData).toEqual([
            { label: 'Chest', value: 1000 },
        ])
    })

    it('distributes volume according to muscle percentages', () => {
        const quad = createMockMuscleGroup({ id: 'quad', name: 'Quadriceps' })
        const glute = createMockMuscleGroup({ id: 'glute', name: 'Glutes' })

        const squat = createMockExercise({
            id: 'squat',
            muscleContributions: [
                { muscleGroupId: 'quad', percentage: 60 },
                { muscleGroupId: 'glute', percentage: 40 },
            ],
        })

        const set = createMockCompletedSet({
            exerciseId: 'squat',
            repGroups: [{ reps: 10, weight: 100, order: 0 }], // 1000 volume total
            completedAt: new Date(),
        })

        useAppStore.setState({
            muscleGroups: [quad, glute],
            exercises: [squat],
            completedSets: [set],
        })

        const { result } = renderHook(() => useMuscleGroupVolumeData())

        expect(result.current.totalVolume).toBe(1000)
        // Check if chart data contains split volume
        // Quads should have 600, Glutes should have 400
        // Chart data is sorted by volume descending
        expect(result.current.chartData).toHaveLength(2)
        const quadData = result.current.chartData.find(d => d.label === 'Quadriceps')
        const gluteData = result.current.chartData.find(d => d.label === 'Glutes')

        expect(quadData?.value).toBe(600)
        expect(gluteData?.value).toBe(400)
    })

    it('aggregates volume from multiple sets for the same muscle', () => {
        const muscle = createMockMuscleGroup({ id: 'chest', name: 'Chest' })
        const exercise = createMockExercise({
            id: 'bench',
            muscleContributions: [{ muscleGroupId: 'chest', percentage: 100 }],
        })

        const set1 = createMockCompletedSet({
            id: 'set-1',
            exerciseId: 'bench',
            repGroups: [{ reps: 10, weight: 100, order: 0 }], // 1000 volume
            completedAt: new Date(),
        })

        const set2 = createMockCompletedSet({
            id: 'set-2',
            exerciseId: 'bench',
            repGroups: [{ reps: 5, weight: 100, order: 0 }], // 500 volume
            completedAt: new Date(),
        })

        useAppStore.setState({
            muscleGroups: [muscle],
            exercises: [exercise],
            completedSets: [set1, set2],
        })

        const { result } = renderHook(() => useMuscleGroupVolumeData())

        expect(result.current.totalVolume).toBe(1500)
        expect(result.current.chartData).toEqual([
            { label: 'Chest', value: 1500 },
        ])
    })

    it('filters out sets older than daysBack', () => {
        const muscle = createMockMuscleGroup({ id: 'chest', name: 'Chest' })
        const exercise = createMockExercise({
            id: 'bench',
            muscleContributions: [{ muscleGroupId: 'chest', percentage: 100 }],
        })

        // Set from today (should include)
        const todaySet = createMockCompletedSet({
            id: 'set-today',
            exerciseId: 'bench',
            repGroups: [{ reps: 10, weight: 100, order: 0 }], // 1000 volume
            completedAt: new Date('2024-01-01T10:00:00Z'),
        })

        // Set from 32 days ago (should exclude default 31 days)
        // Current date is mocked to 2024-01-01
        // 32 days ago is 2023-11-30
        const oldSet = createMockCompletedSet({
            id: 'set-old',
            exerciseId: 'bench',
            repGroups: [{ reps: 10, weight: 100, order: 0 }],
            completedAt: new Date('2023-11-30T10:00:00Z'),
        })

        useAppStore.setState({
            muscleGroups: [muscle],
            exercises: [exercise],
            completedSets: [todaySet, oldSet],
        })

        const { result } = renderHook(() => useMuscleGroupVolumeData(31))

        expect(result.current.totalVolume).toBe(1000)
        expect(result.current.chartData).toEqual([
            { label: 'Chest', value: 1000 },
        ])
    })

    it('handles custom daysBack parameter', () => {
        const muscle = createMockMuscleGroup({ id: 'chest', name: 'Chest' })
        const exercise = createMockExercise({
            id: 'bench',
            muscleContributions: [{ muscleGroupId: 'chest', percentage: 100 }],
        })

        // Set from 7 days ago
        const set7DaysAgo = createMockCompletedSet({
            id: 'set-7',
            exerciseId: 'bench',
            repGroups: [{ reps: 10, weight: 100, order: 0 }],
            completedAt: new Date('2023-12-25T10:00:00Z'), // 7 days before 2024-01-01
        })

        useAppStore.setState({
            muscleGroups: [muscle],
            exercises: [exercise],
            completedSets: [set7DaysAgo],
        })

        // If we look back only 5 days, it should filter out
        const { result: resultSort } = renderHook(() => useMuscleGroupVolumeData(5))
        expect(resultSort.current.totalVolume).toBe(0)

        // If we look back 10 days, it should include
        const { result: resultLong } = renderHook(() => useMuscleGroupVolumeData(10))
        expect(resultLong.current.totalVolume).toBe(1000)
    })

    it('returns empty data when no sets exist', () => {
        useAppStore.setState({
            muscleGroups: [],
            exercises: [],
            completedSets: [],
        })

        const { result } = renderHook(() => useMuscleGroupVolumeData())

        expect(result.current.totalVolume).toBe(0)
        expect(result.current.chartData).toEqual([])
    })

    it('ignores sets for deleted/unknown exercises', () => {
        const muscle = createMockMuscleGroup({ id: 'chest', name: 'Chest' })
        const set = createMockCompletedSet({
            exerciseId: 'deleted-exercise-id',
            repGroups: [{ reps: 10, weight: 100, order: 0 }],
            completedAt: new Date(),
        })

        useAppStore.setState({
            muscleGroups: [muscle],
            exercises: [], // Exercise not found
            completedSets: [set],
        })

        const { result } = renderHook(() => useMuscleGroupVolumeData())

        expect(result.current.totalVolume).toBe(0)
        expect(result.current.chartData).toEqual([])
    })
})
