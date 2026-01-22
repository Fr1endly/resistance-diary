import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useAppStore } from '@/store'
import { cn } from '@/lib/utils'

interface DialogProps {
  title?: string
  children: React.ReactNode
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'full'
}

export default function Dialog({
  title,
  children,
  showCloseButton = true,
  closeOnBackdropClick = true,
  maxWidth = 'md',
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const { isDialogOpen, toggleDialog } = useAppStore()
  const isOpen = isDialogOpen

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        toggleDialog()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, toggleDialog])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-4',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 pointer-events-auto"
            onClick={closeOnBackdropClick ? toggleDialog : undefined}
          />

          {/* Dialog */}
          <div className="fixed inset-x-0 bottom-0 z-50 flex items-end justify-center p-4 pointer-events-none">
            <motion.div
              ref={dialogRef}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
              }}
              className={cn(
                'w-full pointer-events-auto max-h-[90vh] overflow-hidden rounded-3xl',
                'bg-yellow-400/90',
                'border border-white/10',
                'shadow-2xl shadow-black/40',
                maxWidthClasses[maxWidth],
              )}
            >
              {/* Top highlight edge */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between px-6 py-5">
                  {title && (
                    <h2 className="text-xl font-semibold text-neutral-950 font-display">
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={toggleDialog}
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center ml-auto',
                        'bg-neutral-950/10 border border-neutral-950/10',
                        'text-neutral-950 hover:text-neutral-950 hover:bg-neutral-950/10',
                        'transition-all duration-200',
                      )}
                      aria-label="Close dialog"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-80px)] ">
                {children}
              </div>

              {/* Bottom safe area for mobile */}
              <div className="h-safe-area-inset-bottom" />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
