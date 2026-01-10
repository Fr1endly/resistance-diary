import type { CompletedSet, RepGroup } from '@/types'

/**
 * CSV column headers for CompletedSet export
 */
const CSV_HEADERS = [
    'setId',
    'sessionId',
    'exerciseId',
    'plannedSetId',
    'completedAt',
    'notes',
    'repGroupOrder',
    'reps',
    'weight',
] as const

/**
 * Escapes a CSV field value by wrapping in quotes if it contains
 * special characters (comma, quote, newline)
 */
function escapeCsvField(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
    }
    return value
}

/**
 * Parses a CSV line respecting quoted fields
 */
function parseCsvLine(line: string): Array<string> {
    const fields: Array<string> = []
    let field = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const nextChar = line[i + 1]

        if (inQuotes) {
            if (char === '"' && nextChar === '"') {
                field += '"'
                i++ // skip next quote
            } else if (char === '"') {
                inQuotes = false
            } else {
                field += char
            }
        } else {
            if (char === '"') {
                inQuotes = true
            } else if (char === ',') {
                fields.push(field)
                field = ''
            } else {
                field += char
            }
        }
    }
    fields.push(field)
    return fields
}

/**
 * Exports an array of CompletedSets to CSV format.
 * Each RepGroup within a set gets its own row.
 */
export function exportCompletedSetsToCsv(sets: Array<CompletedSet>): string {
    const lines: Array<string> = [CSV_HEADERS.join(',')]

    for (const set of sets) {
        for (const repGroup of set.repGroups) {
            const row = [
                set.id,
                set.sessionId,
                set.exerciseId,
                set.plannedSetId ?? '',
                set.completedAt.toISOString(),
                escapeCsvField(set.notes ?? ''),
                repGroup.order.toString(),
                repGroup.reps.toString(),
                repGroup.weight.toString(),
            ]
            lines.push(row.join(','))
        }
    }

    return lines.join('\n')
}

/**
 * Parses CSV content back to an array of CompletedSets.
 * Aggregates rows by setId to reconstruct RepGroups.
 */
export function parseCompletedSetsFromCsv(csv: string): Array<CompletedSet> {
    const lines = csv.trim().split('\n')

    // Validate header first
    const header = lines[0]
    if (header !== CSV_HEADERS.join(',')) {
        throw new Error(
            'Invalid CSV format: header does not match expected columns',
        )
    }

    // Header-only CSV means no data
    if (lines.length < 2) {
        return []
    }

    // Group rows by setId
    const setsMap = new Map<
        string,
        {
            sessionId: string
            exerciseId: string
            plannedSetId?: string
            completedAt: Date
            notes?: string
            repGroups: Array<RepGroup>
        }
    >()

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const fields = parseCsvLine(line)
        if (fields.length !== CSV_HEADERS.length) {
            throw new Error(`Invalid CSV format at line ${i + 1}: expected ${CSV_HEADERS.length} columns, got ${fields.length}`)
        }

        const [
            setId,
            sessionId,
            exerciseId,
            plannedSetId,
            completedAt,
            notes,
            repGroupOrder,
            reps,
            weight,
        ] = fields

        const repGroup: RepGroup = {
            order: parseInt(repGroupOrder, 10),
            reps: parseInt(reps, 10),
            weight: parseFloat(weight),
        }

        if (setsMap.has(setId)) {
            setsMap.get(setId)!.repGroups.push(repGroup)
        } else {
            setsMap.set(setId, {
                sessionId,
                exerciseId,
                plannedSetId: plannedSetId || undefined,
                completedAt: new Date(completedAt),
                notes: notes || undefined,
                repGroups: [repGroup],
            })
        }
    }

    // Convert map to array of CompletedSets
    const sets: Array<CompletedSet> = []
    for (const [id, data] of setsMap) {
        // Sort repGroups by order
        data.repGroups.sort((a, b) => a.order - b.order)
        sets.push({ id, ...data })
    }

    return sets
}

/**
 * Triggers a browser download of the CSV content
 */
export function downloadCsv(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
