import { useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cva } from 'class-variance-authority';
import type { Toast as ToastType } from '@/store/slices/toastSlice';
import { cn } from '@/lib/utils';

const toastVariants = cva(
  'relative flex items-start gap-3 p-4 rounded-xl shadow-lg glass-card border pointer-events-auto min-w-[300px] max-w-[400px]',
  {
    variants: {
      variant: {
        success: 'border-emerald-500/30 bg-emerald-950/40',
        error: 'border-red-500/30 bg-red-950/40',
        warning: 'border-amber-500/30 bg-amber-950/40',
        info: 'border-blue-500/30 bg-blue-950/40',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const iconVariants = cva('shrink-0', {
  variants: {
    variant: {
      success: 'text-emerald-400',
      error: 'text-red-400',
      warning: 'text-amber-400',
      info: 'text-blue-400',
    },
  },
});

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const Icon = iconMap[toast.variant];

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300,
      }}
      className={cn(toastVariants({ variant: toast.variant }))}
      role={toast.variant === 'error' ? 'alert' : 'status'}
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
    >
      {/* Icon */}
      <Icon className={cn(iconVariants({ variant: toast.variant }), 'size-5')} />

      {/* Message */}
      <div className="flex-1 text-sm font-medium text-white/90">
        {toast.message}
      </div>

      {/* Dismiss Button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-lg p-1 hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="size-4 text-white/60" />
      </button>
    </motion.div>
  );
}
