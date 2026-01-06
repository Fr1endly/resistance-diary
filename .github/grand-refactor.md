Plan: Comprehensive Fitness App Improvements
A unified improvement plan addressing code quality, architecture, testing, performance, and developer experience through quick wins, component refactoring, state management enhancements, and tooling upgrades.

Steps
Quick wins & config fixes (1-2 hours) - Update SEO meta tags in __root.tsx, fix build script order in package.json to tsc && vite build, remove console.logs from production code, move activeRoutineId from settingsSlice to workoutSlice, replace alert() calls in workouts.tsx and training/details.tsx with toast notifications

Tooling & linting (30 min) - Install eslint-plugin-react-hooks and eslint-plugin-jsx-a11y, update eslint.config.js to enable hooks rules (catches useEffect dependency issues) and accessibility rules (catches missing aria-labels), run lint to identify existing violations

State management with Immer (2-3 hours) - Integrate immer middleware into Zustand store in useAppStore.ts, refactor workoutSlice.ts to use Immer for addSetToRoutine, updateRoutine, and nested updates, apply same pattern to sessionSlice.ts for cleaner mutations

WorkoutPlanForm refactor (1 day) - Extract Zod schemas from WorkoutPlanForm.tsx to new src/lib/schemas.ts, split 767-line component into BasicInfoStep, DayPlanStep, ReviewStep sub-components in src/components/workout-form/, add component test for DayPlanStep as testing pattern example

Error handling & UX (half day) - Add ErrorBoundary component wrapping routes in __root.tsx, implement toast notification system (custom or sonner), add loading states to form submissions, add empty state illustrations for workouts and exercises

Performance optimization (half day) - Fix Zustand selectors to use useShallow in workouts.tsx, training/details.tsx, and overview.tsx, remove getState() from useMemo dependencies in useVolumeChartData.ts, add memoization for computed values

Test coverage foundation (2-3 days) - Add unit tests for store slices (workoutSlice, sessionSlice), test training flow and volume calculations in useVolumeChartData, add integration tests for create-routine-to-complete-workout workflow

Further Considerations
Component library decision - Keep custom Button/Input implementations in src/components/ui/ or adopt Shadcn for consistency? Recommend keeping custom (already invested, matches design system) but extract shared patterns.

Testing strategy - Start with component test for DayPlanStep during refactor (validates pattern) or tackle store slices first (higher value)? Recommend both in parallel—component test with refactor, store tests separately.

Toast implementation - Build custom toast to match design system or use sonner/react-hot-toast for speed? Recommend sonner (minimal, customizable) unless specific design requirements exist.