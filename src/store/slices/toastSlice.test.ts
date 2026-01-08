import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useAppStore } from '@/store/useAppStore'

describe('Toast Store', () => {
  beforeEach(() => {
    // Reset the store before each test
    useAppStore.setState({
      toasts: [],
    })
  })

  it('should add a toast', () => {
    const { result } = renderHook(() => useAppStore())

    act(() => {
      result.current.addToast('Test message', 'success')
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe('Test message')
    expect(result.current.toasts[0].variant).toBe('success')
  })

  it('should remove a toast', () => {
    const { result } = renderHook(() => useAppStore())

    act(() => {
      result.current.addToast('Test message', 'info')
    })

    const toastId = result.current.toasts[0].id
    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      result.current.removeToast(toastId)
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('should clear all toasts', () => {
    const { result } = renderHook(() => useAppStore())

    act(() => {
      result.current.addToast('Message 1', 'success')
      result.current.addToast('Message 2', 'error')
      result.current.addToast('Message 3', 'warning')
    })

    expect(result.current.toasts).toHaveLength(3)

    act(() => {
      result.current.clearToasts()
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('should set default duration', () => {
    const { result } = renderHook(() => useAppStore())

    act(() => {
      result.current.addToast('Test message', 'info')
    })

    expect(result.current.toasts[0].duration).toBe(4000)
  })

  it('should accept custom duration', () => {
    const { result } = renderHook(() => useAppStore())

    act(() => {
      result.current.addToast('Test message', 'warning', 8000)
    })

    expect(result.current.toasts[0].duration).toBe(8000)
  })
})
