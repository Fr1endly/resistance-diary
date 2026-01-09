import { memo } from 'react'
import { ArrowRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import SpinnerPicker from '@/components/ui/SpinnerPicker'

interface FloatingControlsProps {
  repTarget: number
  reps: number
  weight: number
  onRepsChange: (value: number) => void
  onWeightChange: (value: number) => void
  onAddRepGroup: () => void
  onFinishSet: () => void
}

export const FloatingControls = memo(function FloatingControls({
  repTarget,
  reps,
  weight,
  onRepsChange,
  onWeightChange,
  onAddRepGroup,
  onFinishSet,
}: FloatingControlsProps) {
  return (
    <div className="w-full">
      <div
        className={cn(
          'rounded-3xl',
          'backdrop-blur-2xl border border-white/10',
        )}
      >
        {/* Target badge */}
        <div className="flex justify-center mb-4">
          <div
            className={cn(
              'px-4 py-1.5 rounded-full',
              'bg-neutral-900 border border-white/10',
            )}
          >
            <span className="text-neutral-200 text-sm">Target: </span>
            <span className="text-neutral-100 font-mono font-bold">
              {repTarget}
            </span>
            <span className="text-neutral-200 text-sm"> reps</span>
          </div>
        </div>

        {/* Inline inputs with divider */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1 flex flex-col items-center">
            <div
              className={cn(
                'w-full rounded-xl overflow-hidden mb-1',
                'bg-white/5 border border-white/10',
              )}
            >
              <SpinnerPicker
                value={reps}
                onChange={onRepsChange}
                min={0}
                max={100}
                step={1}
                containerHeight={70}
                itemHeight={50}
                friction={0.75}
              />
            </div>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
              Reps
            </span>
          </div>

          <div className="h-16 w-px bg-white/10" />

          <div className="flex-1 flex flex-col items-center">
            <div
              className={cn(
                'w-full rounded-xl overflow-hidden mb-1',
                'bg-white/5 border border-white/10',
              )}
            >
              <SpinnerPicker
                value={weight}
                onChange={onWeightChange}
                min={0}
                max={500}
                step={2.5}
                suffix="kg"
                containerHeight={70}
                itemHeight={50}
                friction={0.75}
              />
            </div>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
              Weight
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onAddRepGroup}
            className={cn(
              'flex-1 h-14 rounded-2xl font-bold',
              'bg-neutral-800 text-neutral-100 border border-neutral-700',
              'transition-all duration-200',
              'hover:bg-neutral-700 hover:border-neutral-600',
              'active:scale-[0.98]',
              'flex items-center justify-center gap-2',
            )}
          >
            <Plus size={24} />
          </button>
          <button
            onClick={onFinishSet}
            className={cn(
              'flex-1 h-14 rounded-2xl font-bold',
              'bg-neutral-800 text-neutral-100 border border-neutral-700',
              'transition-all duration-200',
              'hover:bg-neutral-700 hover:border-neutral-600',
              'active:scale-[0.98]',
              'flex items-center justify-center gap-2',
            )}
          >
            Complete Set
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
})
