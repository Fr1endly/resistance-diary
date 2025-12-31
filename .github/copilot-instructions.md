# Copilot Instructions - Fitness Tracker App

## Project Overview
A React fitness/workout tracking PWA for logging resistance training. Users create workout routines with days and planned sets, then track completed sessions and volume over time.

## Tech Stack & Architecture
- **React 19** + **TypeScript** with **Vite** bundler
- **TanStack Router** - File-based routing in `src/routes/`
- **Zustand** - State management with slice pattern in `src/store/slices/`
- **Tailwind CSS v4** - Utility-first styling with custom CSS variables
- **Motion (Framer Motion)** - Animations via `motion/react`

## Key Architecture Patterns

### State Management (Zustand Slices)
Store is composed of slices merged in [src/store/useAppStore.ts](src/store/useAppStore.ts):
```typescript
// Each slice follows this pattern (see src/store/slices/)
export const createWorkoutSlice: StateCreator<WorkoutSlice, [], [], WorkoutSlice> = (set) => ({
  routines: [],
  addRoutine: (routine) => set((state) => ({ routines: [...state.routines, routine] })),
})
```
- **Slices**: `muscleSlice`, `exerciseSlice`, `workoutSlice`, `sessionSlice`, `settingsSlice`
- State persisted to localStorage with custom Date serialization
- Access store via `useAppStore` hook

### Routing (TanStack Router)
- Routes auto-generated in `src/routeTree.gen.ts` - **never edit manually**
- Add routes by creating files in `src/routes/`
- Root layout with context in [src/routes/__root.tsx](src/routes/__root.tsx)

### Component Patterns
- **UI components**: `src/components/ui/` - Reusable primitives using CVA variants
- **Layout**: Slot-based `PageLayout` component with variants (`sectioned`, `glass`)
- **Icons**: Custom SVG components in `src/components/icons/`
- **Charts**: Custom chart components (no charting library)

### Styling Conventions
- Use `cn()` from `@/lib/utils` for conditional classes: `cn("base-class", condition && "conditional-class")`
- Custom fonts: "Work Sans" (display), "Fira Code" (mono) - defined in [src/styles.css](src/styles.css)
- CSS variables for theming (oklch color space): `--primary`, `--background`, etc.
- Animation library: `tw-animate-css` classes

## Domain Model
```
WorkoutRoutine → WorkoutDay[] → PlannedSet[]
                                    ↓
WorkoutSession → CompletedSet[] (tracks actual performance)
```
Types defined in `src/types/` with barrel export from `index.ts`.

## Commands
```bash
npm run dev      # Start dev server on port 3000
npm run build    # Production build (vite + tsc)
npm run test     # Run Vitest tests
npm run check    # Format + lint fix
```

## Import Alias
Use `@/` alias for imports from `src/`:
```typescript
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
```

## Testing
- Vitest + Testing Library for React
- Test files co-located: `Component.test.tsx` next to `Component.tsx`
- Example: [src/components/ui/layout.test.tsx](src/components/ui/layout.test.tsx)
