import { memo } from 'react'
import { ArrowRight, Plus, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import SpinnerPicker from '@/components/ui/SpinnerPicker'

interface FloatingControlsProps {
  reps: number
  weight: number
  onRepsChange: (value: number) => void
  onWeightChange: (value: number) => void
  onAddRepGroup: () => void
  onFinishSet: () => void
  onUnstage: () => void
}

export const FloatingControls = memo(function FloatingControls({
  reps,
  weight,
  onRepsChange,
  onWeightChange,
  onAddRepGroup,
  onFinishSet,
  onUnstage,
}: FloatingControlsProps) {
  return (
    <div className="w-full h-full">
      <div
        className={cn(
          'rounded-3xl h-full pr-4 flex flex-col justify-around',
        )}
      >
        {/* Inline inputs with divider */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1 flex flex-col items-center ">
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
                containerHeight={80}
                itemHeight={50}
                friction={0.75}
              />
            </div>
            <span className="text-[10px] text-neutral-900 uppercase tracking-wider">
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
                containerHeight={80}
                itemHeight={50}
                friction={0.75}
              />
            </div>
            <span className="text-[10px] text-neutral-900 uppercase tracking-wider">
              Weight
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 justify-evenly items-center">
          <button
            onClick={onAddRepGroup}
            className={cn(
              'rounded-full font-bold h-12 w-12',
              'inset-shadow-sm inset-shadow-neutral-500',
              'bg-neutral-800 text-neutral-100 border border-neutral-700',
              'active:scale-[0.98]',
              'flex items-center justify-center gap-2',
            )}
          >
            <Plus size={24} />
          </button>
          <button
            onClick={onUnstage}
            className={cn(
              'rounded-full font-bold h-12 w-12',
              'inset-shadow-sm inset-shadow-neutral-500',
              'bg-neutral-800 text-neutral-100 border border-neutral-700',
              'active:scale-[0.98]',
              'flex items-center justify-center gap-2',
            )}
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={onFinishSet}
            className={cn(
              'rounded-full font-bold h-12 w-12',
              'inset-shadow-sm inset-shadow-neutral-500',
              'bg-neutral-800 text-neutral-100 border border-neutral-700',
              'active:scale-[0.98]',
              'flex items-center justify-center gap-2',
            )}
          >
            <ArrowRight size={20} />
          </button>

        </div>
      </div>
    </div>
  )
})
