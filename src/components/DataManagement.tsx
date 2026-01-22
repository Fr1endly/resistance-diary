import { useRef, useState } from 'react'
import { AlertTriangle, Check, Download, Trash2, Upload, X } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '@/store/useAppStore'
import {
    downloadCsv,
    exportCompletedSetsToCsv,
    parseCompletedSetsFromCsv,
} from '@/lib/csv'
import { cn } from '@/lib/utils'
import ConfirmDialog from './ui/ConfirmDialog'

type ImportMode = 'replace' | 'merge'

interface ImportPreview {
    setCount: number
    mode: ImportMode
}

export default function DataManagement() {
    const { completedSets, importCompletedSets, addToast } = useAppStore(
        useShallow((state) => ({
            completedSets: state.completedSets,
            importCompletedSets: state.importCompletedSets,
            addToast: state.addToast,
        })),
    )

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [importMode, setImportMode] = useState<ImportMode>('merge')
    const [preview, setPreview] = useState<ImportPreview | null>(null)
    const [pendingCsv, setPendingCsv] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

    const handleExport = () => {
        const csv = exportCompletedSetsToCsv(completedSets)
        const date = new Date().toISOString().split('T')[0]
        downloadCsv(csv, `workout-history-${date}.csv`)
        addToast(`Exported ${completedSets.length} sets to CSV`, 'success')
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setError(null)
        setPreview(null)

        const reader = new FileReader()
        reader.onload = (event) => {
            const csv = event.target?.result as string
            try {
                const sets = parseCompletedSetsFromCsv(csv)
                setPendingCsv(csv)
                setPreview({ setCount: sets.length, mode: importMode })
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to parse CSV')
            }
        }
        reader.readAsText(file)
    }

    const handleConfirmImport = () => {
        if (!pendingCsv) return

        try {
            const sets = parseCompletedSetsFromCsv(pendingCsv)
            importCompletedSets(sets, importMode)
            addToast(
                `Imported ${sets.length} sets (${importMode} mode)`,
                'success',
            )
            setPreview(null)
            setPendingCsv(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Import failed')
        }
    }

    const handleCancelImport = () => {
        setPreview(null)
        setPendingCsv(null)
        setError(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleResetApp = () => {
        localStorage.removeItem('resistance-diary-storage')
        window.location.reload()
    }

    return (
        <div className="space-y-4">
            {/* Export Section */}
            <div
                className={cn(
                    'p-4 rounded-2xl',
                    'backdrop-blur-xl bg-white/5 border border-white/10',
                )}
            >
                <h3 className="text-white/90 font-semibold mb-2 flex items-center gap-2">
                    <div
                        className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center',
                            'bg-amber-500/20 border border-amber-400/30',
                        )}
                    >
                        <Download size={16} className="text-amber-400" />
                    </div>
                    Export Data
                </h3>
                <p className="text-white/50 text-sm mb-4">
                    Download your workout history as a CSV file.
                </p>
                <button
                    onClick={handleExport}
                    disabled={completedSets.length === 0}
                    className={cn(
                        'w-full px-4 py-3 rounded-xl font-medium text-sm',
                        'transition-all duration-200 active:scale-[0.98]',
                        completedSets.length === 0
                            ? 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                            : 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/30',
                    )}
                >
                    Export {completedSets.length} Sets to CSV
                </button>
            </div>

            {/* Import Section */}
            <div
                className={cn(
                    'p-4 rounded-2xl',
                    'backdrop-blur-xl bg-white/5 border border-white/10',
                )}
            >
                <h3 className="text-white/90 font-semibold mb-2 flex items-center gap-2">
                    <div
                        className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center',
                            'bg-amber-500/20 border border-amber-400/30',
                        )}
                    >
                        <Upload size={16} className="text-amber-400" />
                    </div>
                    Import Data
                </h3>
                <p className="text-white/50 text-sm mb-4">
                    Restore workout history from a CSV file.
                </p>

                {/* Import Mode Toggle */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setImportMode('merge')}
                        className={cn(
                            'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                            importMode === 'merge'
                                ? 'bg-amber-500/20 border border-amber-400/30 text-amber-400'
                                : 'bg-white/5 border border-white/10 text-white/50 hover:text-white/70',
                        )}
                    >
                        Merge
                    </button>
                    <button
                        onClick={() => setImportMode('replace')}
                        className={cn(
                            'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                            importMode === 'replace'
                                ? 'bg-red-500/20 border border-red-400/30 text-red-400'
                                : 'bg-white/5 border border-white/10 text-white/50 hover:text-white/70',
                        )}
                    >
                        Replace
                    </button>
                </div>

                <p className="text-white/40 text-xs mb-4">
                    {importMode === 'merge'
                        ? 'Merge adds new sets without affecting existing data.'
                        : 'Replace will overwrite all existing workout data.'}
                </p>

                {/* File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        'w-full px-4 py-3 rounded-xl font-medium text-sm',
                        'bg-white/5 border border-white/10 text-white/70',
                        'hover:bg-white/10 hover:text-white',
                        'transition-all duration-200 active:scale-[0.98]',
                    )}
                >
                    Select CSV File
                </button>

                {/* Error Display */}
                {error && (
                    <div className="mt-4 p-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-400 text-sm flex items-center gap-2">
                        <AlertTriangle size={16} />
                        {error}
                    </div>
                )}

                {/* Import Preview */}
                {preview && (
                    <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-400/30">
                        <p className="text-white/80 text-sm mb-3">
                            Ready to import <strong className="text-amber-400">{preview.setCount}</strong> sets using{' '}
                            <strong className="text-amber-400">{importMode}</strong> mode.
                            {importMode === 'replace' && (
                                <span className="block mt-1 text-red-400">
                                    ⚠️ This will delete your existing {completedSets.length} sets!
                                </span>
                            )}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleConfirmImport}
                                className={cn(
                                    'flex-1 px-3 py-2 rounded-lg text-sm font-medium',
                                    'bg-emerald-500/20 border border-emerald-400/30 text-emerald-400',
                                    'hover:bg-emerald-500/30 transition-all',
                                    'flex items-center justify-center gap-1',
                                )}
                            >
                                <Check size={16} />
                                Import
                            </button>
                            <button
                                onClick={handleCancelImport}
                                className={cn(
                                    'flex-1 px-3 py-2 rounded-lg text-sm font-medium',
                                    'bg-white/5 border border-white/10 text-white/70',
                                    'hover:bg-white/10 transition-all',
                                    'flex items-center justify-center gap-1',
                                )}
                            >
                                <X size={16} />
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Danger Zone */}
            <div
                className={cn(
                    'p-4 rounded-2xl',
                    'backdrop-blur-xl bg-white/5 border border-red-500/20',
                )}
            >
                <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                    <div
                        className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center',
                            'bg-red-500/20 border border-red-400/30',
                        )}
                    >
                        <AlertTriangle size={16} className="text-red-400" />
                    </div>
                    Danger Zone
                </h3>
                <p className="text-white/50 text-sm mb-4">
                    Reset the application to its initial state. This action cannot be undone.
                </p>
                <button
                    onClick={() => setIsResetDialogOpen(true)}
                    className={cn(
                        'w-full px-4 py-3 rounded-xl font-medium text-sm',
                        'bg-red-500/10 border border-red-500/20 text-red-400',
                        'hover:bg-red-500/20 hover:text-red-300',
                        'transition-all duration-200 active:scale-[0.98]',
                        'flex items-center justify-center gap-2',
                    )}
                >
                    <Trash2 size={16} />
                    Reset App Data
                </button>
            </div>

            <ConfirmDialog
                open={isResetDialogOpen}
                onClose={() => setIsResetDialogOpen(false)}
                onConfirm={handleResetApp}
                title="Reset Application"
                description="Are you sure you want to delete all data and reset the application? This action cannot be undone."
                variant="danger"
                confirmLabel="Reset Everything"
                warning="All workouts, history, and settings will be permanently lost."
            />
        </div>
    )
}
