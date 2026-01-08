import { nanoid } from 'nanoid';
import type { StateCreator } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

export interface ToastSlice {
  toasts: Array<Toast>;
  addToast: (message: string, variant: ToastVariant, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const createToastSlice: StateCreator<ToastSlice, [], [], ToastSlice> = (set) => ({
  toasts: [],

  addToast: (message, variant, duration = 4000) => {
    const id = nanoid();
    const toast: Toast = { id, message, variant, duration };
    
    set((state) => ({
      toasts: [...state.toasts, toast],
    }));
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
});
