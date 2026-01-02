# WorkoutPlanForm Component

A comprehensive multi-step form for creating and editing `WorkoutPlan` objects using React Hook Form, Zod validation, and shadcn/ui components.

## Features

- **3-Step Process**:
  1. **Basic Info**: Enter workout plan name and description
  2. **Workout Days**: Add and configure each workout day with exercises and sets
  3. **Summary**: Review all inputs before submission

- **Form Validation**: Zod schema validation at each step
- **Dynamic Fields**: Add/remove days, exercises, and sets
- **Type-Safe**: Full TypeScript support with `WorkoutPlan` types
- **Responsive UI**: Built with Tailwind CSS and shadcn/ui components

## Usage

### Basic Example

```tsx
import { WorkoutPlanForm } from '@/components/WorkoutPlanForm'
import useStore from '@/hooks/useStore'
import { addWorkoutPlan } from '@/lib/db'
import type { WorkoutPlan } from '@/types'

function MyPage() {
  const { addWorkout } = useStore()

  const handleSubmit = async (data: Omit<WorkoutPlan, 'id' | 'history'>) => {
    // Create workout with temporary ID
    const newWorkout: WorkoutPlan = {
      ...data,
      id: Date.now(),
      history: []
    }

    // Save to IndexedDB
    const id = await addWorkoutPlan(newWorkout)

    // Update Zustand store
    addWorkout({
      ...newWorkout,
      id: id as number,
    })
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <WorkoutPlanForm onSubmit={handleSubmit} />
    </div>
  )
}
```

### With Initial Data (Edit Mode)

```tsx
<WorkoutPlanForm 
  onSubmit={handleSubmit}
  initialData={{
    name: "Push Pull Legs",
    description: "A 3-day split routine",
    days: [
      {
        id: 1,
        name: "Push Day",
        exercises: [
          {
            name: "Bench Press",
            sets: [
              { number: 1, reps: [10], completed: false }
            ]
          }
        ]
      }
    ]
  }}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `onSubmit` | `(data: Omit<WorkoutPlan, 'id' \| 'history'>) => void` | Callback function when form is submitted |
| `initialData` | `Partial<WorkoutPlan>` | Optional initial values for editing |

## Form Structure

### Step 1: Basic Info
- **Workout Name** (required, min 2 characters)
- **Description** (required, min 5 characters)

### Step 2: Workout Days
For each workout day:
- **Day Name** (required)
- **Exercises** (at least 1 required)
  - Exercise Name (required)
  - Sets (at least 1 required)
    - Reps (number, required)
    - Notes (optional)

### Step 3: Summary
- Review all inputs
- Edit any section by clicking "Edit" buttons
- Submit to save

## Navigation Flow

```
Basic Info → Day 1 → Day 2 → ... → Day N → Summary
     ↑        ↓        ↓              ↓        ↓
     ←────────←────────←──────────────←────────↓
                                            Submit
```

Users can:
- Add multiple workout days
- Navigate forward/backward between days
- Remove days (must keep at least 1)
- Add/remove exercises within a day
- Add/remove sets within an exercise
- Edit any section from the summary page

## Validation Rules

### Workout Plan Level
- Name: minimum 2 characters
- Description: minimum 5 characters
- Days: at least 1 day required

### Workout Day Level
- Name: required
- Exercises: at least 1 exercise required

### Exercise Level
- Name: required
- Sets: at least 1 set required

### Set Level
- Reps: must be at least 1
- Notes: optional

## Type Definitions

The form uses the following types from `@/types/workout`:

```typescript
interface WorkoutPlan {
  id: number
  name: string
  description: string
  days: WorkoutDay[]
  history: WorkoutLogEntry[]
}

interface WorkoutDay {
  id: number
  name: string
  exercises: Exercise[]
}

interface Exercise {
  name: string
  sets: ExerciseSet[]
}

interface ExerciseSet {
  number: number
  reps: number[]
  completed?: boolean
  notes?: string
}
```

## Styling

The form uses Tailwind CSS classes and follows the app's design system:
- Card-based layout for exercises
- Consistent spacing and typography
- Responsive button placement
- Form validation feedback

## Dependencies

- `react-hook-form` - Form state management
- `zod` - Schema validation
- `@hookform/resolvers/zod` - Zod integration with React Hook Form
- shadcn/ui components:
  - `Button`
  - `Form` components
  - `Input`
  - `Textarea`

## Testing the Form

Visit `/test_form` route to see the form in action with full integration to IndexedDB and Zustand store.

## Notes

- The form automatically generates sequential day IDs using `Date.now()`
- Set numbers are auto-generated sequentially (1, 2, 3, ...)
- The form validates each step before allowing navigation to the next step
- All state is managed locally until final submission
- The `id` and `history` fields are excluded from form data and added during submission
