import LZString from 'lz-string'
import type { WorkoutRoutine } from '../types'
import { nanoid } from 'nanoid'

interface ShareableSet {
    e: string   // exerciseId
    r: number   // targetReps
    w?: number  // targetWeight
    s?: number  // restSeconds
    o?: number  // order
}

interface ShareableDay {
    n: string           // name
    s: ShareableSet[]   // plannedSets
    o?: number          // order
}

interface ShareableRoutine {
    n: string           // name
    d?: string          // description
    y: ShareableDay[]   // days
}

// Compress the routine with shortened keys
export function encodeRoutine(routine: WorkoutRoutine): string {
    const shareable: ShareableRoutine = {
        n: routine.name,
        d: routine.description,
        y: routine.days.map(day => ({
            n: day.name,
            o: day.order,
            s: day.plannedSets.map(set => ({
                e: set.exerciseId,
                r: set.targetReps,
                w: set.targetWeight,
                s: set.restSeconds,
                o: set.order,
            })),
        })),
    }

    const jsonString = JSON.stringify(shareable)
    // Compress and make URL-safe
    return LZString.compressToEncodedURIComponent(jsonString)
}

// Decode and expand back to full routine
export function decodeRoutine(encoded: string): WorkoutRoutine | null {
    try {
        const jsonString = LZString.decompressFromEncodedURIComponent(encoded)
        if (!jsonString) return null

        const shareable: ShareableRoutine = JSON.parse(jsonString)

        // Reconstruct full routine with new IDs
        const routine: WorkoutRoutine = {
            id: nanoid(),
            name: shareable.n,
            description: shareable.d,
            createdAt: new Date(),
            updatedAt: new Date(),
            days: shareable.y.map(day => ({
                id: nanoid(),
                name: day.n,
                order: day.o,
                plannedSets: day.s.map(set => ({
                    id: nanoid(),
                    exerciseId: set.e,
                    targetReps: set.r,
                    targetWeight: set.w,
                    restSeconds: set.s,
                    order: set.o,
                })),
            })),
        }

        return routine
    } catch (error) {
        console.error('Failed to decode routine:', error)
        return null
    }
}

export function generateShareUrl(routine: WorkoutRoutine): string {
    const encoded = encodeRoutine(routine)
    return `${window.location.origin}/workouts/import/${encoded}`
}
