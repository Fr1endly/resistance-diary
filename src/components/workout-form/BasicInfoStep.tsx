import { ChevronRight } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'

import type { WorkoutFormValues } from '@/lib/schemas'
import { cn } from '@/lib/utils'

interface BasicInfoStepProps {
  form: UseFormReturn<WorkoutFormValues>
  onNext: () => void
  onCancel?: () => void
}

export function BasicInfoStep({ form, onNext, onCancel }: BasicInfoStepProps) {
  const nameError = form.formState.errors.name?.message

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-white mb-2">
          Create Workout Routine
        </h2>
        <p className="text-white/50 text-sm">
          Start by giving your routine a name
        </p>
      </div>

      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="routine-name"
            className="text-sm font-medium text-white/70"
          >
            Routine Name
          </label>
          <input
            id="routine-name"
            type="text"
            placeholder="e.g., Push Pull Legs"
            className={cn(
              'w-full h-10 px-3 rounded-lg',
              'bg-white/5 border text-white placeholder:text-white/30',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
              nameError ? 'border-red-500/50' : 'border-white/10',
            )}
            {...form.register('name')}
          />
          <p className="text-white/40 text-xs">
            Choose a memorable name for your workout routine
          </p>
          {nameError && <p className="text-red-400 text-xs">{nameError}</p>}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="routine-desc"
            className="text-sm font-medium text-white/70"
          >
            Description (optional)
          </label>
          <textarea
            id="routine-desc"
            placeholder="Describe your workout routine goals..."
            className={cn(
              'w-full px-3 py-2 rounded-lg min-h-25',
              'bg-white/5 border border-white/10 text-white placeholder:text-white/30',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
            )}
            {...form.register('description')}
          />
        </div>
      </div>

      <div className="flex justify-between pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-white/50 hover:text-white/70 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          className={cn(
            'ml-auto px-4 py-2 rounded-xl flex items-center gap-1',
            'bg-amber-500/20 border border-amber-400/30 text-amber-100',
            'hover:bg-amber-500/30 transition-colors',
          )}
        >
          Next: Add Days
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
