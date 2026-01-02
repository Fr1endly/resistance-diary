import { nanoid } from 'nanoid';

import type {
  MuscleGroup,
  Exercise,
  WorkoutRoutine,
  WorkoutDay,
  PlannedSet,
  WorkoutSession,
  CompletedSet,
  RepGroup,
} from '@/types';
import { useAppStore } from '@/store';

// Helper to generate unique IDs
const generateId = () => nanoid();

// Helper to get a random date in the past N days
const getRandomPastDate = (maxDaysAgo: number): Date => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * maxDaysAgo);
  const hoursOffset = Math.floor(Math.random() * 12) + 6; // Between 6am and 6pm
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hoursOffset, Math.floor(Math.random() * 60), 0, 0);
  return date;
};

// Helper to add random variation to weight/reps
const addVariation = (base: number, variationPercent: number = 0.1): number => {
  const variation = base * variationPercent;
  return Math.round((base + (Math.random() - 0.5) * 2 * variation) * 2) / 2; // Round to nearest 0.5
};

// ============================================
// MUSCLE GROUPS
// ============================================
export const mockMuscleGroups: MuscleGroup[] = [
  { id: 'chest', name: 'Chest', category: 'push' },
  { id: 'front-delts', name: 'Front Delts', category: 'push' },
  { id: 'side-delts', name: 'Side Delts', category: 'push' },
  { id: 'triceps', name: 'Triceps', category: 'push' },
  { id: 'upper-back', name: 'Upper Back', category: 'pull' },
  { id: 'lats', name: 'Lats', category: 'pull' },
  { id: 'rear-delts', name: 'Rear Delts', category: 'pull' },
  { id: 'biceps', name: 'Biceps', category: 'pull' },
  { id: 'forearms', name: 'Forearms', category: 'pull' },
  { id: 'quads', name: 'Quadriceps', category: 'legs' },
  { id: 'hamstrings', name: 'Hamstrings', category: 'legs' },
  { id: 'glutes', name: 'Glutes', category: 'legs' },
  { id: 'calves', name: 'Calves', category: 'legs' },
  { id: 'abs', name: 'Abs', category: 'core' },
  { id: 'obliques', name: 'Obliques', category: 'core' },
  { id: 'lower-back', name: 'Lower Back', category: 'core' },
];

// ============================================
// EXERCISES
// ============================================
export const mockExercises: Exercise[] = [
  // Push exercises
  {
    id: 'bench-press',
    name: 'Barbell Bench Press',
    description: 'Classic compound movement for chest development',
    muscleContributions: [
      { muscleGroupId: 'chest', percentage: 60 },
      { muscleGroupId: 'front-delts', percentage: 25 },
      { muscleGroupId: 'triceps', percentage: 15 },
    ],
  },
  {
    id: 'incline-bench',
    name: 'Incline Dumbbell Press',
    description: 'Upper chest focused pressing movement',
    muscleContributions: [
      { muscleGroupId: 'chest', percentage: 55 },
      { muscleGroupId: 'front-delts', percentage: 30 },
      { muscleGroupId: 'triceps', percentage: 15 },
    ],
  },
  {
    id: 'ohp',
    name: 'Overhead Press',
    description: 'Standing shoulder press with barbell',
    muscleContributions: [
      { muscleGroupId: 'front-delts', percentage: 50 },
      { muscleGroupId: 'side-delts', percentage: 25 },
      { muscleGroupId: 'triceps', percentage: 25 },
    ],
  },
  {
    id: 'lateral-raise',
    name: 'Dumbbell Lateral Raise',
    description: 'Isolation movement for side deltoids',
    muscleContributions: [
      { muscleGroupId: 'side-delts', percentage: 85 },
      { muscleGroupId: 'front-delts', percentage: 15 },
    ],
  },
  {
    id: 'tricep-pushdown',
    name: 'Cable Tricep Pushdown',
    description: 'Cable isolation for triceps',
    muscleContributions: [{ muscleGroupId: 'triceps', percentage: 100 }],
  },
  {
    id: 'dips',
    name: 'Weighted Dips',
    description: 'Compound pushing movement',
    muscleContributions: [
      { muscleGroupId: 'chest', percentage: 40 },
      { muscleGroupId: 'triceps', percentage: 40 },
      { muscleGroupId: 'front-delts', percentage: 20 },
    ],
  },
  {
    id: 'cable-fly',
    name: 'Cable Chest Fly',
    description: 'Chest isolation movement',
    muscleContributions: [
      { muscleGroupId: 'chest', percentage: 90 },
      { muscleGroupId: 'front-delts', percentage: 10 },
    ],
  },

  // Pull exercises
  {
    id: 'deadlift',
    name: 'Conventional Deadlift',
    description: 'Full body pulling movement',
    muscleContributions: [
      { muscleGroupId: 'lower-back', percentage: 30 },
      { muscleGroupId: 'glutes', percentage: 25 },
      { muscleGroupId: 'hamstrings', percentage: 20 },
      { muscleGroupId: 'upper-back', percentage: 15 },
      { muscleGroupId: 'forearms', percentage: 10 },
    ],
  },
  {
    id: 'barbell-row',
    name: 'Barbell Bent-Over Row',
    description: 'Compound back movement',
    muscleContributions: [
      { muscleGroupId: 'upper-back', percentage: 40 },
      { muscleGroupId: 'lats', percentage: 35 },
      { muscleGroupId: 'rear-delts', percentage: 10 },
      { muscleGroupId: 'biceps', percentage: 15 },
    ],
  },
  {
    id: 'pull-up',
    name: 'Weighted Pull-Up',
    description: 'Vertical pulling movement',
    muscleContributions: [
      { muscleGroupId: 'lats', percentage: 50 },
      { muscleGroupId: 'upper-back', percentage: 25 },
      { muscleGroupId: 'biceps', percentage: 20 },
      { muscleGroupId: 'forearms', percentage: 5 },
    ],
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    description: 'Cable lat isolation',
    muscleContributions: [
      { muscleGroupId: 'lats', percentage: 55 },
      { muscleGroupId: 'upper-back', percentage: 20 },
      { muscleGroupId: 'biceps', percentage: 20 },
      { muscleGroupId: 'rear-delts', percentage: 5 },
    ],
  },
  {
    id: 'face-pull',
    name: 'Cable Face Pull',
    description: 'Rear delt and upper back movement',
    muscleContributions: [
      { muscleGroupId: 'rear-delts', percentage: 50 },
      { muscleGroupId: 'upper-back', percentage: 40 },
      { muscleGroupId: 'biceps', percentage: 10 },
    ],
  },
  {
    id: 'barbell-curl',
    name: 'Barbell Curl',
    description: 'Bicep isolation movement',
    muscleContributions: [
      { muscleGroupId: 'biceps', percentage: 85 },
      { muscleGroupId: 'forearms', percentage: 15 },
    ],
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    description: 'Bicep and brachialis movement',
    muscleContributions: [
      { muscleGroupId: 'biceps', percentage: 60 },
      { muscleGroupId: 'forearms', percentage: 40 },
    ],
  },

  // Leg exercises
  {
    id: 'squat',
    name: 'Barbell Back Squat',
    description: 'The king of leg exercises',
    muscleContributions: [
      { muscleGroupId: 'quads', percentage: 50 },
      { muscleGroupId: 'glutes', percentage: 30 },
      { muscleGroupId: 'hamstrings', percentage: 10 },
      { muscleGroupId: 'lower-back', percentage: 10 },
    ],
  },
  {
    id: 'front-squat',
    name: 'Front Squat',
    description: 'Quad-dominant squat variation',
    muscleContributions: [
      { muscleGroupId: 'quads', percentage: 65 },
      { muscleGroupId: 'glutes', percentage: 20 },
      { muscleGroupId: 'abs', percentage: 15 },
    ],
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    description: 'Machine compound leg movement',
    muscleContributions: [
      { muscleGroupId: 'quads', percentage: 55 },
      { muscleGroupId: 'glutes', percentage: 30 },
      { muscleGroupId: 'hamstrings', percentage: 15 },
    ],
  },
  {
    id: 'rdl',
    name: 'Romanian Deadlift',
    description: 'Hamstring and glute focused hip hinge',
    muscleContributions: [
      { muscleGroupId: 'hamstrings', percentage: 45 },
      { muscleGroupId: 'glutes', percentage: 35 },
      { muscleGroupId: 'lower-back', percentage: 20 },
    ],
  },
  {
    id: 'leg-curl',
    name: 'Lying Leg Curl',
    description: 'Hamstring isolation',
    muscleContributions: [{ muscleGroupId: 'hamstrings', percentage: 100 }],
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    description: 'Quad isolation movement',
    muscleContributions: [{ muscleGroupId: 'quads', percentage: 100 }],
  },
  {
    id: 'calf-raise',
    name: 'Standing Calf Raise',
    description: 'Calf development exercise',
    muscleContributions: [{ muscleGroupId: 'calves', percentage: 100 }],
  },
  {
    id: 'lunge',
    name: 'Walking Lunge',
    description: 'Unilateral leg movement',
    muscleContributions: [
      { muscleGroupId: 'quads', percentage: 40 },
      { muscleGroupId: 'glutes', percentage: 40 },
      { muscleGroupId: 'hamstrings', percentage: 20 },
    ],
  },

  // Core exercises
  {
    id: 'cable-crunch',
    name: 'Cable Crunch',
    description: 'Weighted ab exercise',
    muscleContributions: [{ muscleGroupId: 'abs', percentage: 100 }],
  },
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    description: 'Lower ab focused movement',
    muscleContributions: [
      { muscleGroupId: 'abs', percentage: 80 },
      { muscleGroupId: 'obliques', percentage: 20 },
    ],
  },
];

// ============================================
// WORKOUT ROUTINES
// ============================================
const createPPLRoutine = (): WorkoutRoutine => {
  const routineId = generateId();
  const now = new Date();
  const createdAt = new Date(now);
  createdAt.setMonth(createdAt.getMonth() - 2); // Created 2 months ago

  const pushDay: WorkoutDay = {
    id: generateId(),
    name: 'Push Day',
    order: 0,
    plannedSets: [
      { id: generateId(), exerciseId: 'bench-press', targetReps: 8, targetWeight: 80, restSeconds: 180, order: 0 },
      { id: generateId(), exerciseId: 'bench-press', targetReps: 8, targetWeight: 80, restSeconds: 180, order: 1 },
      { id: generateId(), exerciseId: 'bench-press', targetReps: 8, targetWeight: 80, restSeconds: 180, order: 2 },
      { id: generateId(), exerciseId: 'ohp', targetReps: 10, targetWeight: 45, restSeconds: 120, order: 3 },
      { id: generateId(), exerciseId: 'ohp', targetReps: 10, targetWeight: 45, restSeconds: 120, order: 4 },
      { id: generateId(), exerciseId: 'ohp', targetReps: 10, targetWeight: 45, restSeconds: 120, order: 5 },
      { id: generateId(), exerciseId: 'incline-bench', targetReps: 12, targetWeight: 28, restSeconds: 90, order: 6 },
      { id: generateId(), exerciseId: 'incline-bench', targetReps: 12, targetWeight: 28, restSeconds: 90, order: 7 },
      { id: generateId(), exerciseId: 'incline-bench', targetReps: 12, targetWeight: 28, restSeconds: 90, order: 8 },
      { id: generateId(), exerciseId: 'lateral-raise', targetReps: 15, targetWeight: 10, restSeconds: 60, order: 9 },
      { id: generateId(), exerciseId: 'lateral-raise', targetReps: 15, targetWeight: 10, restSeconds: 60, order: 10 },
      { id: generateId(), exerciseId: 'lateral-raise', targetReps: 15, targetWeight: 10, restSeconds: 60, order: 11 },
      { id: generateId(), exerciseId: 'tricep-pushdown', targetReps: 12, targetWeight: 25, restSeconds: 60, order: 12 },
      { id: generateId(), exerciseId: 'tricep-pushdown', targetReps: 12, targetWeight: 25, restSeconds: 60, order: 13 },
      { id: generateId(), exerciseId: 'tricep-pushdown', targetReps: 12, targetWeight: 25, restSeconds: 60, order: 14 },
    ],
  };

  const pullDay: WorkoutDay = {
    id: generateId(),
    name: 'Pull Day',
    order: 1,
    plannedSets: [
      { id: generateId(), exerciseId: 'deadlift', targetReps: 5, targetWeight: 140, restSeconds: 240, order: 0 },
      { id: generateId(), exerciseId: 'deadlift', targetReps: 5, targetWeight: 140, restSeconds: 240, order: 1 },
      { id: generateId(), exerciseId: 'deadlift', targetReps: 5, targetWeight: 140, restSeconds: 240, order: 2 },
      { id: generateId(), exerciseId: 'barbell-row', targetReps: 8, targetWeight: 70, restSeconds: 120, order: 3 },
      { id: generateId(), exerciseId: 'barbell-row', targetReps: 8, targetWeight: 70, restSeconds: 120, order: 4 },
      { id: generateId(), exerciseId: 'barbell-row', targetReps: 8, targetWeight: 70, restSeconds: 120, order: 5 },
      { id: generateId(), exerciseId: 'pull-up', targetReps: 8, targetWeight: 10, restSeconds: 120, order: 6 },
      { id: generateId(), exerciseId: 'pull-up', targetReps: 8, targetWeight: 10, restSeconds: 120, order: 7 },
      { id: generateId(), exerciseId: 'pull-up', targetReps: 8, targetWeight: 10, restSeconds: 120, order: 8 },
      { id: generateId(), exerciseId: 'face-pull', targetReps: 15, targetWeight: 20, restSeconds: 60, order: 9 },
      { id: generateId(), exerciseId: 'face-pull', targetReps: 15, targetWeight: 20, restSeconds: 60, order: 10 },
      { id: generateId(), exerciseId: 'face-pull', targetReps: 15, targetWeight: 20, restSeconds: 60, order: 11 },
      { id: generateId(), exerciseId: 'barbell-curl', targetReps: 12, targetWeight: 30, restSeconds: 60, order: 12 },
      { id: generateId(), exerciseId: 'barbell-curl', targetReps: 12, targetWeight: 30, restSeconds: 60, order: 13 },
      { id: generateId(), exerciseId: 'hammer-curl', targetReps: 12, targetWeight: 14, restSeconds: 60, order: 14 },
    ],
  };

  const legDay: WorkoutDay = {
    id: generateId(),
    name: 'Leg Day',
    order: 2,
    plannedSets: [
      { id: generateId(), exerciseId: 'squat', targetReps: 6, targetWeight: 120, restSeconds: 240, order: 0 },
      { id: generateId(), exerciseId: 'squat', targetReps: 6, targetWeight: 120, restSeconds: 240, order: 1 },
      { id: generateId(), exerciseId: 'squat', targetReps: 6, targetWeight: 120, restSeconds: 240, order: 2 },
      { id: generateId(), exerciseId: 'squat', targetReps: 6, targetWeight: 120, restSeconds: 240, order: 3 },
      { id: generateId(), exerciseId: 'rdl', targetReps: 10, targetWeight: 80, restSeconds: 120, order: 4 },
      { id: generateId(), exerciseId: 'rdl', targetReps: 10, targetWeight: 80, restSeconds: 120, order: 5 },
      { id: generateId(), exerciseId: 'rdl', targetReps: 10, targetWeight: 80, restSeconds: 120, order: 6 },
      { id: generateId(), exerciseId: 'leg-press', targetReps: 12, targetWeight: 180, restSeconds: 120, order: 7 },
      { id: generateId(), exerciseId: 'leg-press', targetReps: 12, targetWeight: 180, restSeconds: 120, order: 8 },
      { id: generateId(), exerciseId: 'leg-press', targetReps: 12, targetWeight: 180, restSeconds: 120, order: 9 },
      { id: generateId(), exerciseId: 'leg-curl', targetReps: 12, targetWeight: 40, restSeconds: 60, order: 10 },
      { id: generateId(), exerciseId: 'leg-curl', targetReps: 12, targetWeight: 40, restSeconds: 60, order: 11 },
      { id: generateId(), exerciseId: 'leg-curl', targetReps: 12, targetWeight: 40, restSeconds: 60, order: 12 },
      { id: generateId(), exerciseId: 'calf-raise', targetReps: 15, targetWeight: 60, restSeconds: 60, order: 13 },
      { id: generateId(), exerciseId: 'calf-raise', targetReps: 15, targetWeight: 60, restSeconds: 60, order: 14 },
      { id: generateId(), exerciseId: 'calf-raise', targetReps: 15, targetWeight: 60, restSeconds: 60, order: 15 },
    ],
  };

  return {
    id: routineId,
    name: 'Push Pull Legs',
    description: 'Classic 3-day split focusing on movement patterns',
    days: [pushDay, pullDay, legDay],
    createdAt,
    updatedAt: now,
  };
};

const createUpperLowerRoutine = (): WorkoutRoutine => {
  const routineId = generateId();
  const now = new Date();
  const createdAt = new Date(now);
  createdAt.setMonth(createdAt.getMonth() - 1);

  const upperDay: WorkoutDay = {
    id: generateId(),
    name: 'Upper Body',
    order: 0,
    plannedSets: [
      { id: generateId(), exerciseId: 'bench-press', targetReps: 6, targetWeight: 85, restSeconds: 180, order: 0 },
      { id: generateId(), exerciseId: 'bench-press', targetReps: 6, targetWeight: 85, restSeconds: 180, order: 1 },
      { id: generateId(), exerciseId: 'bench-press', targetReps: 6, targetWeight: 85, restSeconds: 180, order: 2 },
      { id: generateId(), exerciseId: 'barbell-row', targetReps: 6, targetWeight: 75, restSeconds: 180, order: 3 },
      { id: generateId(), exerciseId: 'barbell-row', targetReps: 6, targetWeight: 75, restSeconds: 180, order: 4 },
      { id: generateId(), exerciseId: 'barbell-row', targetReps: 6, targetWeight: 75, restSeconds: 180, order: 5 },
      { id: generateId(), exerciseId: 'ohp', targetReps: 8, targetWeight: 50, restSeconds: 120, order: 6 },
      { id: generateId(), exerciseId: 'ohp', targetReps: 8, targetWeight: 50, restSeconds: 120, order: 7 },
      { id: generateId(), exerciseId: 'ohp', targetReps: 8, targetWeight: 50, restSeconds: 120, order: 8 },
      { id: generateId(), exerciseId: 'lat-pulldown', targetReps: 10, targetWeight: 60, restSeconds: 90, order: 9 },
      { id: generateId(), exerciseId: 'lat-pulldown', targetReps: 10, targetWeight: 60, restSeconds: 90, order: 10 },
      { id: generateId(), exerciseId: 'lat-pulldown', targetReps: 10, targetWeight: 60, restSeconds: 90, order: 11 },
    ],
  };

  const lowerDay: WorkoutDay = {
    id: generateId(),
    name: 'Lower Body',
    order: 1,
    plannedSets: [
      { id: generateId(), exerciseId: 'squat', targetReps: 5, targetWeight: 130, restSeconds: 240, order: 0 },
      { id: generateId(), exerciseId: 'squat', targetReps: 5, targetWeight: 130, restSeconds: 240, order: 1 },
      { id: generateId(), exerciseId: 'squat', targetReps: 5, targetWeight: 130, restSeconds: 240, order: 2 },
      { id: generateId(), exerciseId: 'deadlift', targetReps: 5, targetWeight: 150, restSeconds: 240, order: 3 },
      { id: generateId(), exerciseId: 'deadlift', targetReps: 5, targetWeight: 150, restSeconds: 240, order: 4 },
      { id: generateId(), exerciseId: 'leg-press', targetReps: 10, targetWeight: 200, restSeconds: 120, order: 5 },
      { id: generateId(), exerciseId: 'leg-press', targetReps: 10, targetWeight: 200, restSeconds: 120, order: 6 },
      { id: generateId(), exerciseId: 'leg-press', targetReps: 10, targetWeight: 200, restSeconds: 120, order: 7 },
      { id: generateId(), exerciseId: 'rdl', targetReps: 10, targetWeight: 90, restSeconds: 120, order: 8 },
      { id: generateId(), exerciseId: 'rdl', targetReps: 10, targetWeight: 90, restSeconds: 120, order: 9 },
      { id: generateId(), exerciseId: 'rdl', targetReps: 10, targetWeight: 90, restSeconds: 120, order: 10 },
      { id: generateId(), exerciseId: 'calf-raise', targetReps: 15, targetWeight: 70, restSeconds: 60, order: 11 },
      { id: generateId(), exerciseId: 'calf-raise', targetReps: 15, targetWeight: 70, restSeconds: 60, order: 12 },
    ],
  };

  return {
    id: routineId,
    name: 'Upper Lower Split',
    description: '4-day split alternating between upper and lower body',
    days: [upperDay, lowerDay],
    createdAt,
    updatedAt: now,
  };
};

// ============================================
// SESSION & COMPLETED SET GENERATION
// ============================================
interface GeneratedSessionData {
  sessions: WorkoutSession[];
  completedSets: CompletedSet[];
}

const generateRealisticRepGroups = (targetReps: number, targetWeight: number): RepGroup[] => {
  const groups: RepGroup[] = [];
  let remainingReps = targetReps + Math.floor(Math.random() * 3) - 1; // Slight variation
  let currentOrder = 0;
  const actualWeight = addVariation(targetWeight, 0.05);

  // Sometimes complete all reps in one go
  if (Math.random() > 0.3) {
    groups.push({
      reps: remainingReps,
      weight: actualWeight,
      order: currentOrder,
    });
  } else {
    // Split into multiple rep groups (rest-pause or form breakdown)
    while (remainingReps > 0) {
      const repsThisGroup = Math.min(
        remainingReps,
        Math.floor(Math.random() * 4) + Math.ceil(targetReps / 2)
      );
      groups.push({
        reps: repsThisGroup,
        weight: actualWeight,
        order: currentOrder++,
      });
      remainingReps -= repsThisGroup;
    }
  }

  return groups;
};

const generateSessionsForRoutine = (
  routine: WorkoutRoutine,
  numberOfWeeks: number = 6
): GeneratedSessionData => {
  const sessions: WorkoutSession[] = [];
  const completedSets: CompletedSet[] = [];

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - numberOfWeeks * 7);

  // Simulate training schedule
  let currentDate = new Date(startDate);
  let dayIndex = 0;

  while (currentDate <= today) {
    // Train 4-6 days per week with realistic rest patterns
    const dayOfWeek = currentDate.getDay();
    const isRestDay = dayOfWeek === 0 || (dayOfWeek === 3 && Math.random() > 0.5); // Sunday off, sometimes Wednesday

    if (!isRestDay && Math.random() > 0.15) {
      // 85% attendance rate
      const workoutDay = routine.days[dayIndex % routine.days.length];
      const sessionId = generateId();

      // Set workout time between 6am and 8pm
      const workoutHour = Math.floor(Math.random() * 14) + 6;
      const sessionStart = new Date(currentDate);
      sessionStart.setHours(workoutHour, Math.floor(Math.random() * 60), 0, 0);

      // Workout duration 45-90 minutes
      const sessionEnd = new Date(sessionStart);
      sessionEnd.setMinutes(sessionEnd.getMinutes() + 45 + Math.floor(Math.random() * 45));

      const session: WorkoutSession = {
        id: sessionId,
        routineId: routine.id,
        dayId: workoutDay.id,
        startedAt: sessionStart,
        completedAt: sessionEnd,
        notes: Math.random() > 0.8 ? getRandomSessionNote() : undefined,
      };

      sessions.push(session);

      // Generate completed sets for this session
      for (const plannedSet of workoutDay.plannedSets) {
        const exercise = mockExercises.find((e) => e.id === plannedSet.exerciseId);
        if (!exercise) continue;

        // Progressive overload: slightly increase weights over time
        const weekNumber = Math.floor(
          (currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
        );
        const progressionMultiplier = 1 + weekNumber * 0.01; // 1% per week

        const targetWeight = (plannedSet.targetWeight ?? 0) * progressionMultiplier;

        const completedSet: CompletedSet = {
          id: generateId(),
          sessionId,
          exerciseId: plannedSet.exerciseId,
          plannedSetId: plannedSet.id,
          repGroups: generateRealisticRepGroups(plannedSet.targetReps, targetWeight),
          completedAt: new Date(
            sessionStart.getTime() + Math.random() * (sessionEnd.getTime() - sessionStart.getTime())
          ),
          notes: Math.random() > 0.95 ? getRandomSetNote() : undefined,
        };

        completedSets.push(completedSet);
      }

      dayIndex++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { sessions, completedSets };
};

const getRandomSessionNote = (): string => {
  const notes = [
    'Felt strong today!',
    'Low energy, pushed through',
    'New PR on compound lifts',
    'Good pump, solid session',
    'Shorter rest times, great cardio',
    'Focus on mind-muscle connection',
    'Deload week - lighter weights',
    'Back from rest day, fully recovered',
    'Morning session - prefer this timing',
    'Evening workout after work',
  ];
  return notes[Math.floor(Math.random() * notes.length)];
};

const getRandomSetNote = (): string => {
  const notes = [
    'Form felt off',
    'Easy weight, could go heavier',
    'Last rep was a grind',
    'Perfect execution',
    'Slight pain - monitored',
    'Spotter assisted on last rep',
  ];
  return notes[Math.floor(Math.random() * notes.length)];
};

// ============================================
// MAIN MOCK DATA GENERATION
// ============================================
export interface MockDataOptions {
  weeksOfHistory?: number;
  includeUpperLower?: boolean;
}

export const generateMockData = (options: MockDataOptions = {}) => {
  const { weeksOfHistory = 6, includeUpperLower = true } = options;

  const muscleGroups = [...mockMuscleGroups];
  const exercises = [...mockExercises];
  const routines: WorkoutRoutine[] = [];
  let allSessions: WorkoutSession[] = [];
  let allCompletedSets: CompletedSet[] = [];

  // Generate PPL routine and its sessions
  const pplRoutine = createPPLRoutine();
  routines.push(pplRoutine);
  const pplData = generateSessionsForRoutine(pplRoutine, weeksOfHistory);
  allSessions = [...allSessions, ...pplData.sessions];
  allCompletedSets = [...allCompletedSets, ...pplData.completedSets];

  // Optionally generate Upper/Lower routine
  if (includeUpperLower) {
    const ulRoutine = createUpperLowerRoutine();
    routines.push(ulRoutine);
  }

  return {
    muscleGroups,
    exercises,
    routines,
    sessions: allSessions,
    completedSets: allCompletedSets,
    activeRoutineId: pplRoutine.id,
  };
};

// Generates a minimal set of mock data (e.g., for testing)
export const generateMinMockData = () => {
  // One muscle group
  const muscleGroups: MuscleGroup[] = [
    { id: 'chest', name: 'Chest', category: 'push' },
  ];

  // One exercise
  const exercises: Exercise[] = [
    {
      id: 'bench-press',
      name: 'Barbell Bench Press',
      description: 'Classic compound movement for chest development',
      muscleContributions: [{ muscleGroupId: 'chest', percentage: 100 }],
    },
  ];

  // Two planned sets for the exercise
  const plannedSets: PlannedSet[] = [
    {
      id: generateId(),
      exerciseId: 'bench-press',
      targetReps: 8,
      targetWeight: 60,
      restSeconds: 90,
      order: 0,
    },
    {
      id: generateId(),
      exerciseId: 'bench-press',
      targetReps: 8,
      targetWeight: 60,
      restSeconds: 90,
      order: 1,
    },
  ];

  // One day with those planned sets
  const days: WorkoutDay[] = [
    {
      id: generateId(),
      name: 'Chest Day',
      order: 0,
      plannedSets,
    },
  ];

  // One routine with that day
  const routines: WorkoutRoutine[] = [
    {
      id: generateId(),
      name: 'Minimal Routine',
      description: 'A minimal routine for testing',
      days,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  return {
    muscleGroups,
    exercises,
    routines,
    sessions: [] as WorkoutSession[],
    completedSets: [] as CompletedSet[],
    activeRoutineId: routines[0].id,
  };
}

// ============================================
// STORE POPULATION FUNCTION
// ============================================
export const populateStoreWithMockData = (options: MockDataOptions = {}) => {
  const store = useAppStore.getState();
  const mockData = generateMinMockData();

  // Clear existing data first
  useAppStore.setState({
    muscleGroups: [],
    exercises: [],
    routines: [],
    sessions: [],
    completedSets: [],
    activeRoutineId: null,
    activeSessionId: null,
    currentDayIndex: 0,
    currentSetIndex: 0,
    isWorkoutInProgress: false,
  });

  // Populate with mock data
  mockData.muscleGroups.forEach((mg) => store.addMuscleGroup(mg));
  mockData.exercises.forEach((ex) => store.addExercise(ex));
  mockData.routines.forEach((routine) => store.addRoutine(routine));
  mockData.sessions.forEach((session) => {
    useAppStore.setState((state) => ({
      sessions: [...state.sessions, session],
    }));
  });
  mockData.completedSets.forEach((cs) => store.addCompletedSet(cs));

  // Set active routine
  useAppStore.setState({ activeRoutineId: mockData.activeRoutineId });

  console.log('✅ Mock data populated successfully!');
  console.log(`   - ${mockData.muscleGroups.length} muscle groups`);
  console.log(`   - ${mockData.exercises.length} exercises`);
  console.log(`   - ${mockData.routines.length} routines`);
  console.log(`   - ${mockData.sessions.length} sessions`);
  console.log(`   - ${mockData.completedSets.length} completed sets`);

  return mockData;
};

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================
export const clearAllData = () => {
  useAppStore.setState({
    muscleGroups: [],
    exercises: [],
    routines: [],
    sessions: [],
    completedSets: [],
    activeRoutineId: null,
    activeSessionId: null,
    currentDayIndex: 0,
    currentSetIndex: 0,
    isWorkoutInProgress: false,
  });
  console.log('🗑️ All data cleared');
};

// For development: expose to window
if (typeof window !== 'undefined') {
  (window as any).mockData = {
    populate: populateStoreWithMockData,
    clear: clearAllData,
    generate: generateMinMockData,
  };
}
