import {   animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {MotionValue, PanInfo} from 'framer-motion';

interface SpinnerPickerProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
  className?: string
  itemHeight?: number
  containerHeight?: number
  /** Friction coefficient for inertia (0-1). Lower = more friction, higher = more slide. Default: 0.92 */
  friction?: number
}

interface SpinnerItemProps {
  val: number
  index: number
  y: MotionValue<number>
  itemHeight: number
  suffix: string
  onTap: (index: number) => void
}

// Memoized individual spinner item with its own transforms
const SpinnerItem = memo(({ val, index, y, itemHeight, suffix, onTap }: SpinnerItemProps) => {
  const centerOffset = itemHeight / 2
   // Constant determines how many levels of items are visible
  const levels = 2; 

  const opacity = useTransform(
    y,
  
    [
      -(index + levels) * itemHeight - centerOffset,
      -(index + (levels - 1)) * itemHeight - centerOffset,
      -(index + (levels - 2)) * itemHeight - centerOffset,
      -index * itemHeight - centerOffset,
      -(index - (levels - 2)) * itemHeight - centerOffset,
      -(index - (levels - 1)) * itemHeight - centerOffset,
      -(index - levels) * itemHeight - centerOffset,
    ],
    [0, 0.3, 0.6, 1, 0.6, 0.3, 0]
  )

  const scale = useTransform(
    y,
    [
      -(index + 2) * itemHeight - centerOffset,
      -(index + 1) * itemHeight - centerOffset,
      -index * itemHeight - centerOffset,
      -(index - 1) * itemHeight - centerOffset,
      -(index - 2) * itemHeight - centerOffset,
    ],
    [0.7, 0.85, 1, 0.85, 0.7]
  )

  return (
    <motion.button
      onClick={() => onTap(index)}
      style={{ opacity, scale, height: itemHeight   }}
  
      className="
        rounded-sm flex w-full items-center justify-center font-display text-md font-bold
        transition-colors text-neutral-50 bg-neutral-900"
    >
      {val}
      {suffix && (
        <span className="ml-2 text-xl font-normal ">
          {suffix}
        </span>
      )}
    </motion.button>
  )
})

export default function SpinnerPicker({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = '',
  className = '',
  itemHeight = 60,
  containerHeight = 100,
  friction = 0.92,
}: SpinnerPickerProps) {
  const constraintsRef = useRef<HTMLDivElement>(null)
  const y = useMotionValue(0)
  const [isDragging, setIsDragging] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const velocityRef = useRef(0)
  const lastYRef = useRef(0)
  const lastTimeRef = useRef(Date.now())
  const animationRef = useRef<ReturnType<typeof animate> | null>(null)

  // Memoize values array to prevent recreation on every render
  const values = useMemo(() =>
    Array.from(
      { length: Math.floor((max - min) / step) + 1 },
      (_, i) => min + i * step
    ),
    [min, max, step]
  )

  // Memoize current index calculation
  const currentIndex = useMemo(() =>
    values.indexOf(localValue),
    [values, localValue]
  )

  // Memoize drag constraints
  const dragConstraints = useMemo(() => ({
    top: -(values.length - 1) * itemHeight - itemHeight / 2,
    bottom: -itemHeight / 2
  }), [values.length, itemHeight])

  // Memoize container style
  const containerStyle = useMemo(() => ({
    height: `${containerHeight}px`
  }), [containerHeight])

  // Memoize highlight style
  const highlightStyle = useMemo(() => ({
    height: `${itemHeight}px`
  }), [itemHeight])

  useEffect(() => {
    setLocalValue(value)
    y.set(-currentIndex * itemHeight - itemHeight / 2)
  }, [value, currentIndex, y, itemHeight])

  // Track velocity during drag
  const handleDrag = useCallback(() => {
    const currentY = y.get()
    const now = Date.now()
    const dt = now - lastTimeRef.current
    
    if (dt > 0) {
      velocityRef.current = (currentY - lastYRef.current) / dt * 1000 // px per second
    }
    
    lastYRef.current = currentY
    lastTimeRef.current = now
  }, [y])

  // Snap to nearest value with animation
  const snapToNearest = useCallback((targetY: number) => {
    const minY = -(values.length - 1) * itemHeight - itemHeight / 2
    const maxY = -itemHeight / 2
    
    // Clamp to bounds
    const clampedY = Math.max(minY, Math.min(maxY, targetY))
    
    // Calculate nearest index
    let newIndex = Math.round((-clampedY - itemHeight / 2) / itemHeight)
    newIndex = Math.max(0, Math.min(values.length - 1, newIndex))
    
    const snapY = -newIndex * itemHeight - itemHeight / 2
    const newValue = values[newIndex]
    
    // Animate to snap position
    animationRef.current = animate(y, snapY, {
      type: 'spring',
      stiffness: 400,
      damping: 30,
      onComplete: () => {
        setLocalValue(newValue)
        onChange(newValue)
      }
    })
  }, [values, itemHeight, y, onChange])

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    setIsDragging(false)
    
    const currentY = y.get()
    const velocity = info.velocity.y || velocityRef.current
    
    // Calculate projected position based on velocity with friction decay
    // Using physics: final_position = current + velocity * friction / (1 - friction)
    const projectedDistance = velocity * friction / (1 - friction) / 60 // Normalize for ~60fps feel
    const projectedY = currentY + projectedDistance
    
    snapToNearest(projectedY)
  }, [y, friction, snapToNearest])

  const handleDragStart = useCallback(() => {
    // Cancel any ongoing animation
    if (animationRef.current) {
      animationRef.current.stop()
    }
    setIsDragging(true)
    lastYRef.current = y.get()
    lastTimeRef.current = Date.now()
    velocityRef.current = 0
  }, [y])

  const handleTap = useCallback((index: number) => {
    if (!isDragging) {
      // Cancel any ongoing animation
      if (animationRef.current) {
        animationRef.current.stop()
      }
      const newValue = values[index]
      const snapY = -index * itemHeight - itemHeight / 2
      
      animationRef.current = animate(y, snapY, {
        type: 'spring',
        stiffness: 400,
        damping: 30,
        onComplete: () => {
          setLocalValue(newValue)
          onChange(newValue)
        }
      })
    }
  }, [isDragging, values, itemHeight, y, onChange])

  return (  
    <div
      ref={constraintsRef}
      className={`relative w-full overflow-clip ${className} bg-neutral-900`}
      style={containerStyle}
    >
      {/* Center highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 "
        style={highlightStyle}
      />

      {/* Scrollable list */}
      <motion.div
        drag="y"
        dragConstraints={dragConstraints}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="absolute inset-x-0 top-1/2 flex flex-col items-center overflow-visible "
      >
        {values.map((val, index) => (
          <SpinnerItem
            key={val}
            val={val}
            index={index}
            y={y}
            itemHeight={itemHeight}
            suffix={suffix}
            onTap={handleTap}
          />
        ))}
      </motion.div>
    </div>
  )
}