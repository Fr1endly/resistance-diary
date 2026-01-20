import { useAppStore } from '@/store/useAppStore'
import type { CompletedSet, RepGroup } from '@/types'

declare global {
    interface Window {
        debugStore: {
            populateVolume: (days?: number) => void
            clearVolume: () => void
        }
    }
}

export function setupDebugStore() {
    window.debugStore = {
        populateVolume: (days = 30) => {
            const completedSets: CompletedSet[] = []
            const today = new Date()

            for (let i = 0; i < days; i++) {
                const date = new Date(today)
                date.setDate(today.getDate() - i)

                // Skip some days randomly to make it look realistic
                if (Math.random() > 0.7) continue

                // Random volume for the day (1000 - 5000)
                const dailyVolume = Math.floor(Math.random() * 4000) + 1000
                const weight = 20 // Fixed weight
                const reps = Math.floor(dailyVolume / weight)

                // Create a dummy set
                const repGroup: RepGroup = {
                    reps,
                    weight,
                    order: 1,
                }

                const set: CompletedSet = {
                    id: crypto.randomUUID(),
                    sessionId: 'debug-session',
                    exerciseId: 'debug-exercise',
                    repGroups: [repGroup],
                    completedAt: date,
                }

                completedSets.push(set)
            }

            useAppStore.getState().importCompletedSets(completedSets, 'merge')
            console.log(`Populated store with ${completedSets.length} sets over ${days} days.`)
        },

        clearVolume: () => {
            useAppStore.getState().importCompletedSets([], 'replace')
            console.log('Cleared all completed sets.')
        },
    }
}
