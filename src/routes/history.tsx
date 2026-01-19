import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown, ChevronRight, History } from 'lucide-react'
import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import PageLayout from '@/components/ui/PageLayout'
import DataManagement from '@/components/DataManagement'
import { HistoryList } from '@/components/HistoryList'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

export const Route = createFileRoute('/history')({
    component: Page,
})

function Page() {
    const { completedSets } = useAppStore(
        useShallow((state) => ({
            completedSets: state.completedSets,
        })),
    )

    const [isDataManagementOpen, setIsDataManagementOpen] = useState(false)

    return (
        <PageLayout
            variant="glass"
            bottomSlot={
                <div className="w-full h-full flex flex-col">
                    {/* Data Management Section */}
                    <div className="flex-1 overflow-y-auto -mx-1 mb-2 px-1">
                        <button
                            onClick={() => setIsDataManagementOpen(!isDataManagementOpen)}
                            className="w-full flex items-center justify-between text-base font-semibold text-white/90 uppercase tracking-wider mb-3 hover:text-white/60 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                Data Management
                                <History size={12} />
                            </div>
                            {isDataManagementOpen ? (
                                <ChevronDown size={14} />
                            ) : (
                                <ChevronRight size={14} />
                            )}
                        </button>

                        {isDataManagementOpen && (
                            <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                                <DataManagement />
                            </div>
                        )}
                    </div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="font-display text-2xl font-bold text-white">
                                History
                            </h1>
                            <p className="text-white/50 text-sm mt-1">
                                {completedSets.length}{' '}
                                {completedSets.length === 1 ? 'set' : 'sets'} recorded
                            </p>
                        </div>
                        <div
                            className={cn(
                                'w-12 h-12 rounded-full flex items-center justify-center',
                                'backdrop-blur-md bg-amber-500/20 border border-amber-400/30',
                            )}
                        >
                            <History size={22} className="text-amber-400" />
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div
                        className={cn(
                            'flex items-center gap-4 py-4 px-5 rounded-2xl mb-4',
                            'backdrop-blur-xl bg-white/5 border border-white/10',
                        )}
                    >
                        <div className="text-center flex-1">
                            <div className="text-3xl font-bold text-amber-400 font-mono">
                                {completedSets.length}
                            </div>
                            <div className="text-xs text-white/40 uppercase tracking-wider mt-1">
                                Total Sets
                            </div>
                        </div>
                        <div className="h-12 w-px bg-white/10" />
                        <div className="text-center flex-1">
                            <div className="text-3xl font-bold text-amber-400 font-mono">
                                {completedSets.reduce(
                                    (sum, set) =>
                                        sum +
                                        set.repGroups.reduce(
                                            (s, group) => s + group.reps,
                                            0,
                                        ),
                                    0,
                                )}
                            </div>
                            <div className="text-xs text-white/40 uppercase tracking-wider mt-1">
                                Total Reps
                            </div>
                        </div>
                    </div>

                    <HistoryList />
                </div>
            }
        />
    )
}
