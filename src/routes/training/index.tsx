import { useEffect, useMemo, memo, useState, useCallback } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { nanoid } from 'nanoid'
import { Plus, ArrowRight } from "lucide-react"

import PageLayout from "@/components/ui/PageLayout"
import SpinnerPicker from '@/components/ui/SpinnerPicker'
import Chart from "@/components/ui/ChartWithGrid"
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import type { CompletedSet, RepGroup } from '@/types'

export const Route = createFileRoute('/training/')({
  component: TrainingPage,
})

// ============================================
// COMPONENTS
// ============================================

const FloatingBadge = memo(({
  exerciseName,
  currentSet,
  totalSets
}: {
  exerciseName: string
  currentSet: number
  totalSets: number
}) => (
  <div className="w-full pt-6 px-5">
    <div className={cn(
      "inline-flex items-center gap-3 px-4 py-2.5 rounded-full",
      "backdrop-blur-xl bg-white/5 border border-white/10"
    )}>
      <span className="text-neutral-100 font-medium text-sm">{exerciseName}</span>
      <div className="h-4 w-px bg-white/20" />
      <span className="text-neutral-100 font-mono font-bold">{currentSet}</span>
      <span className="text-neutral-400 font-mono">/</span>
      <span className="text-neutral-400 font-mono">{totalSets}</span>
    </div>
  </div>
))

const CenteredChart = memo(({ data, stagedCount = 0 }: { data: RepGroup[][], stagedCount?: number }) => {
  const processedData = useMemo(() => {
    if (!data.length) return []
    return data.map(repGroups =>
      repGroups.map(rg => ({
        weight: rg.weight,
        reps: rg.reps,
      }))
    )
  }, [data])

  return (
    <div className="w-full h-[280px] flex items-start justify-center bg-black/20 rounded-xs py-4">
      <div className="w-full h-full max-h-[280px] overflow-hidden p-2">
        <Chart processedData={processedData} title="" stagedCount={stagedCount} />
      </div>
    </div>
  )
})

const FloatingControls = memo(({
  repTarget,
  reps,
  weight,
  onRepsChange,
  onWeightChange,
  onAddRepGroup,
  onFinishSet
}: {
  repTarget: number
  reps: number
  weight: number
  onRepsChange: (value: number) => void
  onWeightChange: (value: number) => void
  onAddRepGroup: () => void
  onFinishSet: () => void
}) => (
  <div className="w-full">
    <div className={cn(
      "rounded-3xl",
      "backdrop-blur-2xl border border-white/10"
    )}>
      {/* Target badge */}
      <div className="flex justify-center mb-4">
        <div className={cn(
          "px-4 py-1.5 rounded-full",
          "bg-neutral-900 border border-white/10"
        )}>
          <span className="text-neutral-200 text-sm">Target: </span>
          <span className="text-neutral-100 font-mono font-bold">{repTarget}</span>
          <span className="text-neutral-200 text-sm"> reps</span>
        </div>
      </div>

      {/* Inline inputs with divider */}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex-1 flex flex-col items-center">
          <div className={cn(
            "w-full rounded-xl overflow-hidden mb-1",
            "bg-white/5 border border-white/10"
          )}>
            <SpinnerPicker
              value={reps}
              onChange={onRepsChange}
              min={0}
              max={100}
              step={1}
              containerHeight={70}
              itemHeight={50}
            />
          </div>
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Reps</span>
        </div>

        <div className="h-16 w-px bg-white/10" />

        <div className="flex-1 flex flex-col items-center">
          <div className={cn(
            "w-full rounded-xl overflow-hidden mb-1 ",
            "bg-white/5 border border-white/10"
          )}>
            <SpinnerPicker
              value={weight}
              onChange={onWeightChange}
              min={0}
              max={500}
              step={2.5}
              suffix="kg"
              containerHeight={70}
              itemHeight={50}
            />
          </div>
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Weight</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onAddRepGroup}
          className={cn(
            "flex-1 h-14 rounded-2xl font-bold",
            "bg-neutral-800 text-neutral-100 border border-neutral-700",
            "transition-all duration-200",
            "hover:bg-neutral-700 hover:border-neutral-600",
            "active:scale-[0.98]",
            "flex items-center justify-center gap-2"
          )}
        >
          <Plus size={24} />
        </button>
        <button
          onClick={onFinishSet}
          className={cn(
            "flex-1 h-14 rounded-2xl font-bold",
            "bg-neutral-800 text-neutral-100 border border-neutral-700",
            "transition-all duration-200",
            "hover:bg-neutral-700 hover:border-neutral-600",
            "active:scale-[0.98]",
            "flex items-center justify-center gap-2"
          )}
        >
          Complete Set
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  </div>
))

// ============================================
// MAIN PAGE
// ============================================

function TrainingPage() {
  const navigate = useNavigate()

  // Store state
  const {
    isWorkoutInProgress,
    activeSessionId,
    activeRoutineId,
    currentSetIndex,
    routines,
    exercises,
    completedSets,
    addCompletedSet,
    nextSet,
    completeSession,
  } = useAppStore()

  // Local state for current rep input
  const [reps, setReps] = useState(0)
  const [weight, setWeight] = useState(0)
  const [stagedRepGroups, setStagedRepGroups] = useState<RepGroup[]>([])

  // Get active routine and day
  const activeRoutine = useMemo(
    () => routines.find(r => r.id === activeRoutineId),
    [routines, activeRoutineId]
  )

  const activeSession = useMemo(
    () => useAppStore.getState().sessions.find(s => s.id === activeSessionId),
    [activeSessionId]
  )

  const activeDay = useMemo(
    () => activeRoutine?.days.find(d => d.id === activeSession?.dayId),
    [activeRoutine, activeSession]
  )

  const plannedSets = activeDay?.plannedSets ?? []
  const currentPlannedSet = plannedSets[currentSetIndex]

  const currentExercise = useMemo(
    () => exercises.find(ex => ex.id === currentPlannedSet?.exerciseId),
    [exercises, currentPlannedSet]
  )

  // Group planned sets by exercise to calculate total sets per exercise
  const exerciseSetCounts = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = {}
    plannedSets.forEach(ps => {
      if (!counts[ps.exerciseId]) {
        counts[ps.exerciseId] = { total: 0, completed: 0 }
      }
      counts[ps.exerciseId].total++
    })
    // Count completed sets
    const sessionSets = completedSets.filter(cs => cs.sessionId === activeSessionId)
    sessionSets.forEach(cs => {
      if (counts[cs.exerciseId]) {
        counts[cs.exerciseId].completed++
      }
    })
    return counts
  }, [plannedSets, completedSets, activeSessionId])

  // Current exercise progress
  const currentExerciseProgress = currentExercise
    ? exerciseSetCounts[currentExercise.id]
    : { total: 0, completed: 0 }

  // Calculate which set number this is for the current exercise
  const currentSetForExercise = useMemo(() => {
    if (!currentPlannedSet) return 1
    let count = 0
    for (let i = 0; i <= currentSetIndex && i < plannedSets.length; i++) {
      if (plannedSets[i].exerciseId === currentPlannedSet.exerciseId) {
        count++
      }
    }
    return count
  }, [plannedSets, currentSetIndex, currentPlannedSet])

  // Redirect if not in workout
  useEffect(() => {
    if (!isWorkoutInProgress) {
      navigate({ to: '/' })
    }
  }, [isWorkoutInProgress, navigate])

  // Set default weight from planned set
  useEffect(() => {
    if (currentPlannedSet?.targetWeight) {
      setWeight(currentPlannedSet.targetWeight)
    }
  }, [currentPlannedSet])

  // Reset staged groups when moving to next set
  useEffect(() => {
    setStagedRepGroups([])
    setReps(0)
  }, [currentSetIndex])

  // Handlers
  const handleRepsChange = useCallback((value: number) => setReps(value), [])
  const handleWeightChange = useCallback((value: number) => setWeight(value), [])

  const handleAddRepGroup = useCallback(() => {
    if (reps <= 0) {
      alert("Please add at least one rep")
      return
    }
    const newGroup: RepGroup = {
      reps,
      weight,
      order: stagedRepGroups.length,
    }
    setStagedRepGroups(prev => [...prev, newGroup])
    setReps(0) // Reset reps for next input
  }, [reps, weight, stagedRepGroups.length])

  const handleFinishSet = useCallback(() => {
    if (!currentPlannedSet || !activeSessionId) return

    // Include current input if there are reps
    let finalRepGroups = [...stagedRepGroups]
    if (reps > 0) {
      finalRepGroups.push({
        reps,
        weight,
        order: finalRepGroups.length,
      })
    }

    if (finalRepGroups.length === 0) {
      alert("Please add at least one rep group before completing the set")
      return
    }

    const completedSet: CompletedSet = {
      id: nanoid(),
      sessionId: activeSessionId,
      exerciseId: currentPlannedSet.exerciseId,
      plannedSetId: currentPlannedSet.id,
      repGroups: finalRepGroups,
      completedAt: new Date(),
    }

    addCompletedSet(completedSet)

    // Check if this was the last set
    if (currentSetIndex >= plannedSets.length - 1) {
      completeSession()
      navigate({ to: '/' })
    } else {
      nextSet()
    }
  }, [
    currentPlannedSet,
    activeSessionId,
    stagedRepGroups,
    reps,
    weight,
    addCompletedSet,
    currentSetIndex,
    plannedSets.length,
    completeSession,
    nextSet,
    navigate,
  ])

  // Chart data - show historic completed sets + current session + staged
  const { chartData, stagedCount } = useMemo(() => {
    // Get all completed sets for this exercise (historic + current session)
    const allExerciseCompletedSets = completedSets.filter(
      cs => cs.exerciseId === currentPlannedSet?.exerciseId
    )
    const data = allExerciseCompletedSets.map(cs => cs.repGroups)
    let staged = 0

    // Add staged as preview
    if (stagedRepGroups.length > 0 || reps > 0) {
      const preview = [...stagedRepGroups]
      if (reps > 0) {
        preview.push({ reps, weight, order: preview.length })
      }
      data.push(preview)
      staged = 1
    }

    return { chartData: data, stagedCount: staged }
  }, [completedSets, currentPlannedSet, stagedRepGroups, reps, weight])

  // Guard
  if (!currentExercise || !currentPlannedSet) {
    return null
  }

  return (
    <PageLayout
      variant="sectioned"
      upperSlot={
        <FloatingBadge
          exerciseName={currentExercise.name}
          currentSet={currentSetForExercise}
          totalSets={currentExerciseProgress.total}
        />
      }
      middleLeftSlot={<CenteredChart data={chartData} stagedCount={stagedCount} />}
      bottomUpper={
        <div className="relative w-full h-full flex flex-col justify-end gap-8">
          <FloatingControls
            repTarget={currentPlannedSet.targetReps}
            reps={reps}
            weight={weight}
            onRepsChange={handleRepsChange}
            onWeightChange={handleWeightChange}
            onAddRepGroup={handleAddRepGroup}
            onFinishSet={handleFinishSet}
          />
        </div>
      }
    />
  )
} 