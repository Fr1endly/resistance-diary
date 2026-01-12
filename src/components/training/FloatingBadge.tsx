import { memo } from 'react'
import { cn } from '@/lib/utils'

interface FloatingBadgeProps {
  exerciseName: string
  currentSet: number
  totalSets: number
}

export const FloatingBadge = memo(function FloatingBadge({
  exerciseName,
  currentSet,
  totalSets,
}: FloatingBadgeProps) {
  return (
    <div className="w-full px-5 flex justify-center items-center">
      <div
        className={cn(
          'inline-flex items-center gap-3 px-4 py-2.5 rounded-full',
          'backdrop-blur-xl bg-white/5 border border-white/10',
        )}
      >
        <span className="text-neutral-100 font-medium text-sm">
          {exerciseName}
        </span>
        <div className="h-4 w-px bg-white/20" />
        <span className="text-neutral-100 font-mono font-bold">
          {currentSet}
        </span>
        <span className="text-neutral-400 font-mono">/</span>
        <span className="text-neutral-400 font-mono">{totalSets}</span>
      </div>
    </div>
  )
})
