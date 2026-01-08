import { useCallback } from 'react'
import type { ToastVariant } from '@/store/slices/toastSlice'
import { useAppStore } from '@/store'

export function useToast() {
  const addToast = useAppStore((state) => state.addToast)

  const toast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration?: number) => {
      addToast(message, variant, duration)
    },
    [addToast],
  )

  const success = useCallback(
    (message: string, duration?: number) => {
      addToast(message, 'success', duration)
    },
    [addToast],
  )

  const error = useCallback(
    (message: string, duration?: number) => {
      addToast(message, 'error', duration)
    },
    [addToast],
  )

  const warning = useCallback(
    (message: string, duration?: number) => {
      addToast(message, 'warning', duration)
    },
    [addToast],
  )

  const info = useCallback(
    (message: string, duration?: number) => {
      addToast(message, 'info', duration)
    },
    [addToast],
  )

  return {
    toast,
    success,
    error,
    warning,
    info,
  }
}
