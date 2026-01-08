import { useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, X } from 'lucide-react'

import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  warning?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  warning,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
}: ConfirmDialogProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    },
    [open, onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [handleEscape])

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-101',
              'rounded-t-3xl p-6 pb-10',
              'bg-neutral-900 border-t border-white/10'
            )}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className={cn(
                'absolute top-4 right-4 p-2 rounded-full',
                'text-white/50 hover:text-white/80 hover:bg-white/10',
                'transition-colors'
              )}
            >
              <X size={20} />
            </button>

            {/* Icon */}
            {variant !== 'default' && (
              <div
                className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center mb-4',
                  variant === 'danger' && 'bg-red-500/20 border border-red-500/30',
                  variant === 'warning' && 'bg-amber-500/20 border border-amber-500/30'
                )}
              >
                <AlertTriangle
                  size={28}
                  className={cn(
                    variant === 'danger' && 'text-red-400',
                    variant === 'warning' && 'text-amber-400'
                  )}
                />
              </div>
            )}

            {/* Title */}
            <h2 className="font-display text-xl font-bold text-white mb-2">{title}</h2>

            {/* Description */}
            {description && <p className="text-white/60 text-sm mb-4">{description}</p>}

            {/* Warning */}
            {warning && (
              <div
                className={cn(
                  'rounded-xl p-4 mb-6',
                  'bg-amber-500/10 border border-amber-500/20'
                )}
              >
                <p className="text-amber-200 text-sm">{warning}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className={cn(
                  'flex-1 h-12 rounded-2xl font-medium text-sm',
                  'backdrop-blur-md bg-white/5 border border-white/10',
                  'text-white/60 transition-all duration-200',
                  'hover:bg-white/10 hover:text-white/80',
                  'active:scale-[0.98]'
                )}
              >
                {cancelLabel}
              </button>
              <button
                onClick={handleConfirm}
                className={cn(
                  'flex-1 h-12 rounded-2xl font-semibold text-sm',
                  'transition-all duration-200 active:scale-[0.98]',
                  variant === 'danger' &&
                    'bg-red-500/20 border border-red-500/30 text-red-100 hover:bg-red-500/30',
                  variant === 'warning' &&
                    'bg-amber-500/20 border border-amber-400/30 text-amber-100 hover:bg-amber-500/30',
                  variant === 'default' &&
                    'bg-amber-500/20 border border-amber-400/30 text-amber-100 hover:bg-amber-500/30'
                )}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
