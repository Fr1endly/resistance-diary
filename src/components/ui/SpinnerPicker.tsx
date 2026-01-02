import { motion, useMotionValue, useTransform, type PanInfo, type MotionValue } from 'framer-motion'
import { useEffect, useState, useRef, useMemo, memo } from 'react'

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
      style={{ opacity:1, scale, height: itemHeight   }}
  
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
}: SpinnerPickerProps) {
  const constraintsRef = useRef<HTMLDivElement>(null)
  const y = useMotionValue(0)
  const [isDragging, setIsDragging] = useState(false)
  const [localValue, setLocalValue] = useState(value)

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

  const handleDragEnd = (_: unknown, _info: PanInfo) => {
    setIsDragging(false)
    const currentY = y.get()

    let newIndex = Math.round((-currentY - itemHeight / 2) / itemHeight)
    newIndex = Math.max(0, Math.min(values.length - 1, newIndex))

    const newValue = values[newIndex]
    setLocalValue(newValue)
    onChange(newValue) 

    y.set(-newIndex * itemHeight - itemHeight / 2)
  }

  const handleTap = (index: number) => {
    if (!isDragging) {
      const newValue = values[index]
      setLocalValue(newValue)
      onChange(newValue)
      y.set(-index * itemHeight - itemHeight / 2)
    }
  }

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
        dragElastic={0.2}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
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