import { describe, expect, it } from 'vitest'
import { exportCompletedSetsToCsv, parseCompletedSetsFromCsv } from './csv'
import type { CompletedSet } from '@/types'

// ============================================
// TEST HELPERS
// ============================================

const createMockCompletedSet = (
    overrides?: Partial<CompletedSet>,
): CompletedSet => ({
    id: 'cs-1',
    sessionId: 'session-1',
    exerciseId: 'exercise-1',
    repGroups: [{ reps: 10, weight: 50, order: 0 }],
    completedAt: new Date('2024-01-01T10:00:00Z'),
    ...overrides,
})

// ============================================
// TESTS
// ============================================

describe('csv utilities', () => {
    describe('exportCompletedSetsToCsv', () => {
        it('exports empty array to header only', () => {
            const result = exportCompletedSetsToCsv([])
            expect(result).toBe(
                'setId,sessionId,exerciseId,plannedSetId,completedAt,notes,repGroupOrder,reps,weight',
            )
        })

        it('exports single set with single rep group', () => {
            const sets = [createMockCompletedSet()]
            const result = exportCompletedSetsToCsv(sets)
            const lines = result.split('\n')

            expect(lines).toHaveLength(2)
            expect(lines[1]).toBe(
                'cs-1,session-1,exercise-1,,2024-01-01T10:00:00.000Z,,0,10,50',
            )
        })

        it('exports set with multiple rep groups as multiple rows', () => {
            const sets = [
                createMockCompletedSet({
                    repGroups: [
                        { reps: 10, weight: 50, order: 0 },
                        { reps: 8, weight: 55, order: 1 },
                        { reps: 6, weight: 60, order: 2 },
                    ],
                }),
            ]
            const result = exportCompletedSetsToCsv(sets)
            const lines = result.split('\n')

            expect(lines).toHaveLength(4) // header + 3 rep groups
            expect(lines[1]).toContain('0,10,50')
            expect(lines[2]).toContain('1,8,55')
            expect(lines[3]).toContain('2,6,60')
        })

        it('exports optional fields correctly', () => {
            const sets = [
                createMockCompletedSet({
                    plannedSetId: 'planned-1',
                    notes: 'Great set!',
                }),
            ]
            const result = exportCompletedSetsToCsv(sets)
            const lines = result.split('\n')

            expect(lines[1]).toContain('planned-1')
            expect(lines[1]).toContain('Great set!')
        })

        it('escapes notes with commas', () => {
            const sets = [
                createMockCompletedSet({
                    notes: 'Heavy, felt good',
                }),
            ]
            const result = exportCompletedSetsToCsv(sets)

            expect(result).toContain('"Heavy, felt good"')
        })

        it('escapes notes with quotes', () => {
            const sets = [
                createMockCompletedSet({
                    notes: 'Said "wow" after',
                }),
            ]
            const result = exportCompletedSetsToCsv(sets)

            expect(result).toContain('"Said ""wow"" after"')
        })

        it('exports multiple sets', () => {
            const sets = [
                createMockCompletedSet({ id: 'cs-1' }),
                createMockCompletedSet({ id: 'cs-2', exerciseId: 'exercise-2' }),
            ]
            const result = exportCompletedSetsToCsv(sets)
            const lines = result.split('\n')

            expect(lines).toHaveLength(3)
            expect(lines[1]).toContain('cs-1')
            expect(lines[2]).toContain('cs-2')
        })
    })

    describe('parseCompletedSetsFromCsv', () => {
        it('parses empty CSV (header only) to empty array', () => {
            const csv =
                'setId,sessionId,exerciseId,plannedSetId,completedAt,notes,repGroupOrder,reps,weight'
            const result = parseCompletedSetsFromCsv(csv)

            expect(result).toEqual([])
        })

        it('parses single set with single rep group', () => {
            const csv = `setId,sessionId,exerciseId,plannedSetId,completedAt,notes,repGroupOrder,reps,weight
cs-1,session-1,exercise-1,,2024-01-01T10:00:00.000Z,,0,10,50`
            const result = parseCompletedSetsFromCsv(csv)

            expect(result).toHaveLength(1)
            expect(result[0].id).toBe('cs-1')
            expect(result[0].sessionId).toBe('session-1')
            expect(result[0].exerciseId).toBe('exercise-1')
            expect(result[0].plannedSetId).toBeUndefined()
            expect(result[0].notes).toBeUndefined()
            expect(result[0].repGroups).toHaveLength(1)
            expect(result[0].repGroups[0]).toEqual({ reps: 10, weight: 50, order: 0 })
        })

        it('parses multiple rows for same set into single set with multiple rep groups', () => {
            const csv = `setId,sessionId,exerciseId,plannedSetId,completedAt,notes,repGroupOrder,reps,weight
cs-1,session-1,exercise-1,,2024-01-01T10:00:00.000Z,,0,10,50
cs-1,session-1,exercise-1,,2024-01-01T10:00:00.000Z,,1,8,55
cs-1,session-1,exercise-1,,2024-01-01T10:00:00.000Z,,2,6,60`
            const result = parseCompletedSetsFromCsv(csv)

            expect(result).toHaveLength(1)
            expect(result[0].repGroups).toHaveLength(3)
            expect(result[0].repGroups[0].reps).toBe(10)
            expect(result[0].repGroups[1].reps).toBe(8)
            expect(result[0].repGroups[2].reps).toBe(6)
        })

        it('parses optional fields correctly', () => {
            const csv = `setId,sessionId,exerciseId,plannedSetId,completedAt,notes,repGroupOrder,reps,weight
cs-1,session-1,exercise-1,planned-1,2024-01-01T10:00:00.000Z,Great set!,0,10,50`
            const result = parseCompletedSetsFromCsv(csv)

            expect(result[0].plannedSetId).toBe('planned-1')
            expect(result[0].notes).toBe('Great set!')
        })

        it('parses quoted fields with commas', () => {
            const csv = `setId,sessionId,exerciseId,plannedSetId,completedAt,notes,repGroupOrder,reps,weight
cs-1,session-1,exercise-1,,2024-01-01T10:00:00.000Z,"Heavy, felt good",0,10,50`
            const result = parseCompletedSetsFromCsv(csv)

            expect(result[0].notes).toBe('Heavy, felt good')
        })

        it('parses quoted fields with escaped quotes', () => {
            const csv = `setId,sessionId,exerciseId,plannedSetId,completedAt,notes,repGroupOrder,reps,weight
cs-1,session-1,exercise-1,,2024-01-01T10:00:00.000Z,"Said ""wow"" after",0,10,50`
            const result = parseCompletedSetsFromCsv(csv)

            expect(result[0].notes).toBe('Said "wow" after')
        })

        it('throws on invalid header', () => {
            const csv = 'wrong,header,format'

            expect(() => parseCompletedSetsFromCsv(csv)).toThrow('Invalid CSV format')
        })

        it('throws on wrong number of columns', () => {
            const csv = `setId,sessionId,exerciseId,plannedSetId,completedAt,notes,repGroupOrder,reps,weight
cs-1,session-1,exercise-1`

            expect(() => parseCompletedSetsFromCsv(csv)).toThrow(
                'Invalid CSV format at line 2',
            )
        })

        it('parses dates correctly', () => {
            const csv = `setId,sessionId,exerciseId,plannedSetId,completedAt,notes,repGroupOrder,reps,weight
cs-1,session-1,exercise-1,,2024-06-15T14:30:00.000Z,,0,10,50`
            const result = parseCompletedSetsFromCsv(csv)

            expect(result[0].completedAt).toBeInstanceOf(Date)
            expect(result[0].completedAt.toISOString()).toBe(
                '2024-06-15T14:30:00.000Z',
            )
        })

        it('parses decimal weights', () => {
            const csv = `setId,sessionId,exerciseId,plannedSetId,completedAt,notes,repGroupOrder,reps,weight
cs-1,session-1,exercise-1,,2024-01-01T10:00:00.000Z,,0,10,52.5`
            const result = parseCompletedSetsFromCsv(csv)

            expect(result[0].repGroups[0].weight).toBe(52.5)
        })
    })

    describe('round-trip (export → import)', () => {
        it('preserves data through export and import', () => {
            const original: Array<CompletedSet> = [
                createMockCompletedSet({
                    id: 'cs-1',
                    sessionId: 'session-1',
                    exerciseId: 'exercise-1',
                    plannedSetId: 'planned-1',
                    notes: 'First set',
                    repGroups: [
                        { reps: 10, weight: 50, order: 0 },
                        { reps: 8, weight: 55, order: 1 },
                    ],
                }),
                createMockCompletedSet({
                    id: 'cs-2',
                    sessionId: 'session-1',
                    exerciseId: 'exercise-2',
                    repGroups: [{ reps: 12, weight: 30, order: 0 }],
                }),
            ]

            const csv = exportCompletedSetsToCsv(original)
            const parsed = parseCompletedSetsFromCsv(csv)

            expect(parsed).toHaveLength(2)

            // Check first set
            expect(parsed[0].id).toBe('cs-1')
            expect(parsed[0].plannedSetId).toBe('planned-1')
            expect(parsed[0].notes).toBe('First set')
            expect(parsed[0].repGroups).toHaveLength(2)
            expect(parsed[0].repGroups[0].reps).toBe(10)
            expect(parsed[0].repGroups[1].reps).toBe(8)

            // Check second set
            expect(parsed[1].id).toBe('cs-2')
            expect(parsed[1].repGroups).toHaveLength(1)
            expect(parsed[1].repGroups[0].reps).toBe(12)
        })

        it('preserves special characters in notes', () => {
            const original = [
                createMockCompletedSet({
                    notes: 'Said "great, amazing" work!',
                }),
            ]

            const csv = exportCompletedSetsToCsv(original)
            const parsed = parseCompletedSetsFromCsv(csv)

            expect(parsed[0].notes).toBe('Said "great, amazing" work!')
        })
    })
})
