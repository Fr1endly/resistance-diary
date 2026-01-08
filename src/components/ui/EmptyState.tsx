import { cn } from '@/lib/utils'

interface EmptyStateAction {
  label: string
  onClick: () => void
}

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: EmptyStateAction
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex-1 flex flex-col items-center justify-center py-12',
        className,
      )}
    >
      <div
        className={cn(
          'w-20 h-20 rounded-full flex items-center justify-center mb-4',
          'backdrop-blur-md bg-white/5 border border-white/10',
        )}
      >
        {icon}
      </div>
      <p className="font-display text-lg text-white/50 mb-1">{title}</p>
      <p className="text-white/40 text-sm mb-6 text-center max-w-xs">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'px-5 py-2.5 rounded-full font-medium text-sm',
            'backdrop-blur-md bg-amber-500/20 border border-amber-400/30',
            'text-amber-100 transition-all duration-200',
            'hover:bg-amber-500/30 hover:border-amber-400/50',
            'active:scale-95',
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
