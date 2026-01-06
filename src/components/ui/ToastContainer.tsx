import { AnimatePresence } from 'motion/react';
import { useAppStore } from '@/store';
import { Toast } from './Toast';

const MAX_TOASTS = 3;

export function ToastContainer() {
  const { toasts, removeToast } = useAppStore();

  // Limit visible toasts to MAX_TOASTS (show newest)
  const visibleToasts = toasts.slice(-MAX_TOASTS);

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
