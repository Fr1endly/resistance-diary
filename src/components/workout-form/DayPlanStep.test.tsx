import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DayPlanStep } from './DayPlanStep'
import type { Exercise } from '@/types'
import { workoutFormSchema } from '@/lib/schemas'

// Mock Reorder from motion/react
vi.mock('motion/react', () => ({
  Reorder: {
    Group: ({ children, onReorder, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    Item: ({ children, value, dragListener, dragControls, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
  useDragControls: () => ({
    start: vi.fn(),
  }),
}))

// Mock Icons
vi.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="icon-chevron-left" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
  Plus: () => <span data-testid="icon-plus" />,
  Trash2: () => <span data-testid="icon-trash" />,
  X: () => <span data-testid="icon-x" />,
  ChevronDown: () => <span data-testid="icon-chevron-down" />,
  ChevronUp: () => <span data-testid="icon-chevron-up" />,
  Check: () => <span data-testid="icon-check" />,
}))
vi.mock('@/components/icons', () => ({
  GripVertical: () => <span data-testid="icon-grip" />,
}))

// Test Wrapper to provide Form Context
const TestWrapper = ({
  children,
  defaultValues,
}: {
  children: (methods: any) => React.ReactNode
  defaultValues?: any
}) => {
  const methods = useForm({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: defaultValues || {
      name: 'Test Routine',
      days: [
        {
          id: 'day-1',
          name: 'Day 1',
          plannedSets: [],
        },
      ],
    },
    mode: 'onBlur',
  })

  return <FormProvider {...methods}>{children(methods)}</FormProvider>
}

const mockExercises: Array<Exercise> = [
  {
    id: 'ex-1',
    name: 'Bench Press',
    muscleContributions: [{ muscleGroupId: 'chest', percentage: 100 }],
    description: 'Barbell press',
  },
  {
    id: 'ex-2',
    name: 'Squat',
    muscleContributions: [{ muscleGroupId: 'legs', percentage: 100 }],
    description: 'Barbell squat',
  },
]

describe('DayPlanStep', () => {
  it('renders correctly', () => {
    render(
      <TestWrapper>
        {(form) => (
          <DayPlanStep
            form={form}
            exercises={mockExercises}
            dayIndex={0}
            totalDays={1}
            onNext={vi.fn()}
            onPrevious={vi.fn()}
            onAddDay={vi.fn()}
            onRemoveDay={vi.fn()}
          />
        )}
      </TestWrapper>,
    )

    expect(screen.getByText('Day 1 of 1')).toBeDefined()
    expect(screen.getByPlaceholderText('e.g., Pull Day')).toBeDefined()
    expect(screen.getByText('Add Exercise Set')).toBeDefined()
  })

  it('allows adding a planned set', async () => {
    render(
      <TestWrapper>
        {(form) => (
          <DayPlanStep
            form={form}
            exercises={mockExercises}
            dayIndex={0}
            totalDays={1}
            onNext={vi.fn()}
            onPrevious={vi.fn()}
            onAddDay={vi.fn()}
            onRemoveDay={vi.fn()}
          />
        )}
      </TestWrapper>,
    )

    // Initial state: no sets
    // Click add button
    const addButton = screen.getByText('Add Exercise Set')
    fireEvent.click(addButton)

    // Should see new set inputs
    expect(await screen.findByText('Reps')).toBeDefined()
    expect(screen.getByText('Rest (s)')).toBeDefined()
  })

  it('calls onNext when valid and button clicked', () => {
    const onNext = vi.fn()
    render(
      <TestWrapper
        defaultValues={{
          name: 'Test',
          days: [
            {
              id: 'd1',
              name: 'Leg Day',
              plannedSets: [
                {
                  id: 's1',
                  exerciseId: 'ex-2',
                  targetReps: 5,
                  restSeconds: 90,
                  order: 0,
                },
              ],
            },
          ],
        }}
      >
        {(form) => (
          <DayPlanStep
            form={form}
            exercises={mockExercises}
            dayIndex={0}
            totalDays={1}
            onNext={onNext}
            onPrevious={vi.fn()}
            onAddDay={vi.fn()}
            onRemoveDay={vi.fn()}
          />
        )}
      </TestWrapper>,
    )

    const nextBtn = screen.getByText('Review Routine')
    fireEvent.click(nextBtn)

    // onNext is called by parent usually, but here the button click calls props.onNext directly
    // Wait, the DayPlanStep button calls `onNext` passed prop directly, passing validation responsibility to parent?
    // Let's check DayPlanStep implementation.
    // In original code: <button onClick={onNext} ...>
    // So yes, it just clicks. Validation is in the parent.
    expect(onNext).toHaveBeenCalled()
  })

  it('calls onAddDay when add day button clicked', () => {
    const onAddDay = vi.fn()
    render(
      <TestWrapper>
        {(form) => (
          <DayPlanStep
            form={form}
            exercises={mockExercises}
            dayIndex={0}
            totalDays={1}
            onNext={vi.fn()}
            onPrevious={vi.fn()}
            onAddDay={onAddDay}
            onRemoveDay={vi.fn()}
          />
        )}
      </TestWrapper>,
    )

    fireEvent.click(screen.getByText('+ Add Another Day'))
    expect(onAddDay).toHaveBeenCalled()
  })
})
