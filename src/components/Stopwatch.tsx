import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Format milliseconds to MM:SS
function formatTime(ms: number): { minutes: string; seconds: string } {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return {
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  }
}

// Play a beep sound using Web Audio API
function playBeep() {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
  const audioContext = new AudioContextClass()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = 880 // A5 note
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.3)
}

// Single digit component with animation
function Digit({ value, className }: { value: string; className?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0.5, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={cn('inline-block tabular-nums', className)}
    >
      {value}
    </motion.span>
  )
}

interface StopwatchProps {
  className?: string
}

export function Stopwatch({ className }: StopwatchProps) {
  // Zustand state and actions
  const elapsedMs = useAppStore((state) => state.stopwatchElapsedMs)
  const isRunning = useAppStore((state) => state.stopwatchIsRunning)
  const startTimestamp = useAppStore((state) => state.stopwatchStartTimestamp)
  const startStopwatch = useAppStore((state) => state.startStopwatch)
  const stopStopwatch = useAppStore((state) => state.stopStopwatch)
  const resetStopwatch = useAppStore((state) => state.resetStopwatch)
  const tickStopwatch = useAppStore((state) => state.tickStopwatch)

  // Track the last minute we beeped at to avoid duplicate beeps
  const lastBeepMinute = useRef(-1)

  // Tick interval when running
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      tickStopwatch()
    }, 100) // Update every 100ms for smooth seconds display

    return () => clearInterval(interval)
  }, [isRunning, tickStopwatch])

  // Play beep every 60 seconds (at 59s mark to account for sound delay)
  useEffect(() => {
    if (!isRunning) return

    const currentMinute = Math.floor(elapsedMs / 60000)
    const secondsIntoMinute = Math.floor((elapsedMs % 60000) / 1000)

    // Beep at 59 seconds to account for sound delay
    if (secondsIntoMinute === 59 && currentMinute !== lastBeepMinute.current) {
      lastBeepMinute.current = currentMinute
      playBeep()
    }
  }, [elapsedMs, isRunning])

  // Reset beep tracker when stopwatch is reset
  useEffect(() => {
    if (elapsedMs === 0) {
      lastBeepMinute.current = -1
    }
  }, [elapsedMs])

  // Resume stopwatch on mount if it was running (page navigation recovery)
  useEffect(() => {
    if (startTimestamp !== null && !isRunning) {
      // Was running when navigated away, restart
      startStopwatch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount - intentionally empty to run once

  const { minutes, seconds } = formatTime(elapsedMs)
  const hasTime = elapsedMs > 0

  return (
    <div className={cn('flex flex-col justify-center items-center gap-12 p-6', className)}>
      {/* Glass container for stopwatch display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
      >
        {/* Digital time display */}
        <div className="font-mono text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight">
          <span className="text-amber-400">
            <Digit value={minutes[0]} />
            <Digit value={minutes[1]} />
          </span>
          <span className="text-white/40 mx-1">:</span>
          <span className="text-amber-400">
            <Digit value={seconds[0]} />
            <Digit value={seconds[1]} />
          </span>
        </div>
      </motion.div>

      {/* Control buttons */}
      <div className="flex gap-4">
        {/* Start/Stop button */}
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant={isRunning ? 'destructive' : 'default'}
            size="lg"
            onClick={isRunning ? stopStopwatch : startStopwatch}
            className="min-w-28 text-base font-semibold"
          >
            {isRunning ? 'Stop' : 'Start'}
          </Button>
        </motion.div>

        {/* Reset button - only show when there's time and not running */}
        {hasTime && !isRunning && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={resetStopwatch}
              className="min-w-28 text-base font-semibold"
            >
              Reset
            </Button>
          </motion.div>
        )}
      </div>

      {/* Running indicator */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-white/50 text-sm font-mono"
        >
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-2 h-2 rounded-full bg-emerald-400"
          />
          Running
        </motion.div>
      )}
    </div>
  )
}
