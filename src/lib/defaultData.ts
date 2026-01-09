import { nanoid } from 'nanoid'
import type { Exercise, MuscleGroup, WorkoutRoutine } from '@/types'

export const DEFAULT_MUSCLE_GROUPS: Array<MuscleGroup> = [
  // PUSH
  { id: 'chest', name: 'Chest', category: 'push' },
  { id: 'shoulders_front', name: 'Anterior Deltoids', category: 'push' },
  { id: 'shoulders_medial', name: 'Medial Deltoids', category: 'push' },
  { id: 'triceps', name: 'Triceps', category: 'push' },

  // PULL
  { id: 'lats', name: 'Latissimus Dorsi', category: 'pull' },
  { id: 'upper_back', name: 'Upper Back (Rhomboids)', category: 'pull' },
  { id: 'rear_delts', name: 'Posterior Deltoids', category: 'pull' },
  { id: 'biceps', name: 'Biceps', category: 'pull' },
  { id: 'forearms', name: 'Forearms', category: 'pull' },
  { id: 'traps', name: 'Trapezius', category: 'pull' },

  // LEGS
  { id: 'quadriceps', name: 'Quadriceps', category: 'legs' },
  { id: 'hamstrings', name: 'Hamstrings', category: 'legs' },
  { id: 'glutes', name: 'Glutes', category: 'legs' },
  { id: 'calves', name: 'Calves', category: 'legs' },
  { id: 'adductors', name: 'Adductors', category: 'legs' },

  // CORE
  { id: 'abs', name: 'Rectus Abdominis', category: 'core' },
  { id: 'obliques', name: 'Obliques', category: 'core' },
  { id: 'lower_back', name: 'Erector Spinae', category: 'core' },
  { id: 'core_stabilizers', name: 'Core Stabilizers', category: 'core' },
]

export const DEFAULT_EXERCISES: Array<Exercise> = [
  // === COMPOUND LOWER BODY ===
  {
    id: 'back_squat',
    name: 'Back Squat',
    muscleContributions: [
      { muscleGroupId: 'quadriceps', percentage: 45 },
      { muscleGroupId: 'glutes', percentage: 30 },
      { muscleGroupId: 'core_stabilizers', percentage: 15 },
      { muscleGroupId: 'adductors', percentage: 10 },
    ],
  },
  {
    id: 'front_squat',
    name: 'Front Squat',
    muscleContributions: [
      { muscleGroupId: 'quadriceps', percentage: 50 },
      { muscleGroupId: 'glutes', percentage: 25 },
      { muscleGroupId: 'core_stabilizers', percentage: 15 },
      { muscleGroupId: 'adductors', percentage: 10 },
    ],
  },
  {
    id: 'goblet_squat',
    name: 'Goblet Squat',
    muscleContributions: [
      { muscleGroupId: 'quadriceps', percentage: 45 },
      { muscleGroupId: 'glutes', percentage: 30 },
      { muscleGroupId: 'core_stabilizers', percentage: 15 },
      { muscleGroupId: 'adductors', percentage: 10 },
    ],
  },
  {
    id: 'bulgarian_split_squat',
    name: 'Bulgarian Split Squat',
    muscleContributions: [
      { muscleGroupId: 'quadriceps', percentage: 40 },
      { muscleGroupId: 'glutes', percentage: 35 },
      { muscleGroupId: 'core_stabilizers', percentage: 15 },
      { muscleGroupId: 'hamstrings', percentage: 10 },
    ],
  },
  {
    id: 'lunges',
    name: 'Lunges',
    muscleContributions: [
      { muscleGroupId: 'quadriceps', percentage: 40 },
      { muscleGroupId: 'glutes', percentage: 35 },
      { muscleGroupId: 'hamstrings', percentage: 15 },
      { muscleGroupId: 'core_stabilizers', percentage: 10 },
    ],
  },

  {
    id: 'deadlift',
    name: 'Conventional Deadlift',
    muscleContributions: [
      { muscleGroupId: 'glutes', percentage: 35 },
      { muscleGroupId: 'hamstrings', percentage: 30 },
      { muscleGroupId: 'lower_back', percentage: 20 },
      { muscleGroupId: 'lats', percentage: 10 },
      { muscleGroupId: 'core_stabilizers', percentage: 5 },
    ],
  },
  {
    id: 'sumo_deadlift',
    name: 'Sumo Deadlift',
    muscleContributions: [
      { muscleGroupId: 'glutes', percentage: 40 },
      { muscleGroupId: 'hamstrings', percentage: 25 },
      { muscleGroupId: 'adductors', percentage: 20 },
      { muscleGroupId: 'lower_back', percentage: 15 },
    ],
  },
  {
    id: 'good_morning',
    name: 'Good Morning',
    muscleContributions: [
      { muscleGroupId: 'hamstrings', percentage: 45 },
      { muscleGroupId: 'lower_back', percentage: 35 },
      { muscleGroupId: 'glutes', percentage: 20 },
    ],
  },
  {
    id: 'kettlebell_swing',
    name: 'Kettlebell Swing',
    muscleContributions: [
      { muscleGroupId: 'glutes', percentage: 40 },
      { muscleGroupId: 'hamstrings', percentage: 30 },
      { muscleGroupId: 'core_stabilizers', percentage: 20 },
      { muscleGroupId: 'lower_back', percentage: 10 },
    ],
  },
  {
    id: 'leg_press',
    name: 'Leg Press',
    muscleContributions: [
      { muscleGroupId: 'quadriceps', percentage: 50 },
      { muscleGroupId: 'glutes', percentage: 30 },
      { muscleGroupId: 'adductors', percentage: 20 },
    ],
  },
  {
    id: 'romanian_deadlift',
    name: 'Romanian Deadlift',
    muscleContributions: [
      { muscleGroupId: 'hamstrings', percentage: 45 },
      { muscleGroupId: 'glutes', percentage: 35 },
      { muscleGroupId: 'lower_back', percentage: 20 },
    ],
  },
  {
    id: 'hip_thrust',
    name: 'Hip Thrust',
    muscleContributions: [
      { muscleGroupId: 'glutes', percentage: 70 },
      { muscleGroupId: 'hamstrings', percentage: 20 },
      { muscleGroupId: 'core_stabilizers', percentage: 10 },
    ],
  },

  // === ISOLATION LOWER BODY ===
  {
    id: 'leg_extension',
    name: 'Leg Extension',
    muscleContributions: [{ muscleGroupId: 'quadriceps', percentage: 100 }],
  },
  {
    id: 'leg_curl',
    name: 'Leg Curl',
    muscleContributions: [{ muscleGroupId: 'hamstrings', percentage: 100 }],
  },
  {
    id: 'nordic_curl',
    name: 'Nordic Curl',
    muscleContributions: [
      { muscleGroupId: 'hamstrings', percentage: 85 },
      { muscleGroupId: 'glutes', percentage: 15 },
    ],
  },
  {
    id: 'standing_calf_raise',
    name: 'Standing Calf Raise',
    muscleContributions: [{ muscleGroupId: 'calves', percentage: 100 }],
  },
  {
    id: 'seated_calf_raise',
    name: 'Seated Calf Raise',
    muscleContributions: [
      { muscleGroupId: 'calves', percentage: 90 },
      { muscleGroupId: 'core_stabilizers', percentage: 10 },
    ],
  },

  // === COMPOUND PUSH ===
  {
    id: 'bench_press',
    name: 'Bench Press',
    muscleContributions: [
      { muscleGroupId: 'chest', percentage: 50 },
      { muscleGroupId: 'triceps', percentage: 30 },
      { muscleGroupId: 'shoulders_front', percentage: 20 },
    ],
  },
  {
    id: 'incline_bench_press',
    name: 'Incline Bench Press',
    muscleContributions: [
      { muscleGroupId: 'chest', percentage: 45 },
      { muscleGroupId: 'shoulders_front', percentage: 30 },
      { muscleGroupId: 'triceps', percentage: 25 },
    ],
  },
  {
    id: 'overhead_press',
    name: 'Overhead Press',
    muscleContributions: [
      { muscleGroupId: 'shoulders_front', percentage: 45 },
      { muscleGroupId: 'triceps', percentage: 30 },
      { muscleGroupId: 'shoulders_medial', percentage: 15 },
      { muscleGroupId: 'core_stabilizers', percentage: 10 },
    ],
  },
  {
    id: 'lateral_raise',
    name: 'Lateral Raise',
    muscleContributions: [
      { muscleGroupId: 'shoulders_medial', percentage: 85 },
      { muscleGroupId: 'traps', percentage: 15 },
    ],
  },
  {
    id: 'decline_bench_press',
    name: 'Decline Bench Press',
    muscleContributions: [
      { muscleGroupId: 'chest', percentage: 60 },
      { muscleGroupId: 'triceps', percentage: 25 },
      { muscleGroupId: 'shoulders_front', percentage: 15 },
    ],
  },
  {
    id: 'chest_fly',
    name: 'Chest Fly',
    muscleContributions: [
      { muscleGroupId: 'chest', percentage: 85 },
      { muscleGroupId: 'shoulders_front', percentage: 15 },
    ],
  },
  {
    id: 'push_up',
    name: 'Push-Up',
    muscleContributions: [
      { muscleGroupId: 'chest', percentage: 45 },
      { muscleGroupId: 'triceps', percentage: 30 },
      { muscleGroupId: 'shoulders_front', percentage: 15 },
      { muscleGroupId: 'core_stabilizers', percentage: 10 },
    ],
  },
  {
    id: 'dip_chest',
    name: 'Chest Dip',
    muscleContributions: [
      { muscleGroupId: 'chest', percentage: 50 },
      { muscleGroupId: 'triceps', percentage: 35 },
      { muscleGroupId: 'shoulders_front', percentage: 15 },
    ],
  },

  {
    id: 'arnold_press',
    name: 'Arnold Press',
    muscleContributions: [
      { muscleGroupId: 'shoulders_front', percentage: 40 },
      { muscleGroupId: 'shoulders_medial', percentage: 30 },
      { muscleGroupId: 'triceps', percentage: 20 },
      { muscleGroupId: 'core_stabilizers', percentage: 10 },
    ],
  },
  {
    id: 'upright_row',
    name: 'Upright Row',
    muscleContributions: [
      { muscleGroupId: 'traps', percentage: 40 },
      { muscleGroupId: 'shoulders_medial', percentage: 40 },
      { muscleGroupId: 'biceps', percentage: 20 },
    ],
  },
  {
    id: 'skull_crusher',
    name: 'Skull Crusher',
    muscleContributions: [
      { muscleGroupId: 'triceps', percentage: 90 },
      { muscleGroupId: 'forearms', percentage: 10 },
    ],
  },
  {
    id: 'triceps_pushdown',
    name: 'Cable Triceps Pushdown',
    muscleContributions: [
      { muscleGroupId: 'triceps', percentage: 90 },
      { muscleGroupId: 'forearms', percentage: 10 },
    ],
  },

  // === COMPOUND PULL ===
  {
    id: 'pull_up',
    name: 'Pull-Up',
    muscleContributions: [
      { muscleGroupId: 'lats', percentage: 45 },
      { muscleGroupId: 'biceps', percentage: 25 },
      { muscleGroupId: 'upper_back', percentage: 20 },
      { muscleGroupId: 'forearms', percentage: 10 },
    ],
  },
  {
    id: 'barbell_row',
    name: 'Barbell Row',
    muscleContributions: [
      { muscleGroupId: 'upper_back', percentage: 35 },
      { muscleGroupId: 'lats', percentage: 35 },
      { muscleGroupId: 'biceps', percentage: 20 },
      { muscleGroupId: 'rear_delts', percentage: 10 },
    ],
  },
  {
    id: 'face_pull',
    name: 'Face Pull',
    muscleContributions: [
      { muscleGroupId: 'rear_delts', percentage: 50 },
      { muscleGroupId: 'upper_back', percentage: 30 },
      { muscleGroupId: 'traps', percentage: 20 },
    ],
  },
  {
    id: 'barbell_curl',
    name: 'Barbell Curl',
    muscleContributions: [
      { muscleGroupId: 'biceps', percentage: 85 },
      { muscleGroupId: 'forearms', percentage: 15 },
    ],
  },
  {
    id: 'lat_pulldown',
    name: 'Lat Pulldown',
    muscleContributions: [
      { muscleGroupId: 'lats', percentage: 50 },
      { muscleGroupId: 'upper_back', percentage: 20 },
      { muscleGroupId: 'biceps', percentage: 20 },
      { muscleGroupId: 'forearms', percentage: 10 },
    ],
  },
  {
    id: 'seated_row',
    name: 'Seated Cable Row',
    muscleContributions: [
      { muscleGroupId: 'upper_back', percentage: 40 },
      { muscleGroupId: 'lats', percentage: 30 },
      { muscleGroupId: 'biceps', percentage: 20 },
      { muscleGroupId: 'rear_delts', percentage: 10 },
    ],
  },
  {
    id: 'shrugs',
    name: 'Shrugs',
    muscleContributions: [
      { muscleGroupId: 'traps', percentage: 90 },
      { muscleGroupId: 'forearms', percentage: 10 },
    ],
  },

  {
    id: 'hammer_curl',
    name: 'Hammer Curl',
    muscleContributions: [
      { muscleGroupId: 'biceps', percentage: 50 },
      { muscleGroupId: 'forearms', percentage: 50 },
    ],
  },
  {
    id: 'reverse_curl',
    name: 'Reverse Curl',
    muscleContributions: [
      { muscleGroupId: 'forearms', percentage: 60 },
      { muscleGroupId: 'biceps', percentage: 40 },
    ],
  },

  // === CORE ===
  {
    id: 'plank',
    name: 'Plank',
    muscleContributions: [
      { muscleGroupId: 'core_stabilizers', percentage: 50 },
      { muscleGroupId: 'abs', percentage: 40 },
      { muscleGroupId: 'lower_back', percentage: 10 },
    ],
  },
  {
    id: 'ab_wheel',
    name: 'Ab Wheel Rollout',
    muscleContributions: [
      { muscleGroupId: 'abs', percentage: 50 },
      { muscleGroupId: 'core_stabilizers', percentage: 30 },
      { muscleGroupId: 'lower_back', percentage: 20 },
    ],
  },
  {
    id: 'russian_twist',
    name: 'Russian Twist',
    muscleContributions: [
      { muscleGroupId: 'obliques', percentage: 60 },
      { muscleGroupId: 'abs', percentage: 30 },
      { muscleGroupId: 'core_stabilizers', percentage: 10 },
    ],
  },
  {
    id: 'back_extension',
    name: 'Back Extension',
    muscleContributions: [
      { muscleGroupId: 'lower_back', percentage: 60 },
      { muscleGroupId: 'glutes', percentage: 25 },
      { muscleGroupId: 'hamstrings', percentage: 15 },
    ],
  },
]

export const beginnerLP: WorkoutRoutine = {
  id: nanoid(),
  name: 'r/Fitness Beginner Linear Progression',
  description: 'Full body A/B linear progression routine for beginners.',
  createdAt: new Date(),
  updatedAt: new Date(),
  days: [
    {
      id: nanoid(),
      name: 'Workout A',
      order: 1,
      plannedSets: [
        {
          id: nanoid(),
          exerciseId: 'back_squat',
          targetReps: 5,
          restSeconds: 180,
          order: 1,
        },
        {
          id: nanoid(),
          exerciseId: 'bench_press',
          targetReps: 5,
          restSeconds: 180,
          order: 2,
        },
        {
          id: nanoid(),
          exerciseId: 'barbell_row',
          targetReps: 5,
          restSeconds: 180,
          order: 3,
        },
      ],
    },
    {
      id: nanoid(),
      name: 'Workout B',
      order: 2,
      plannedSets: [
        {
          id: nanoid(),
          exerciseId: 'back_squat',
          targetReps: 5,
          restSeconds: 180,
          order: 1,
        },
        {
          id: nanoid(),
          exerciseId: 'overhead_press',
          targetReps: 5,
          restSeconds: 180,
          order: 2,
        },
        {
          id: nanoid(),
          exerciseId: 'deadlift',
          targetReps: 5,
          restSeconds: 240,
          order: 3,
        },
      ],
    },
  ],
}

export const phul: WorkoutRoutine = {
  id: nanoid(),
  name: 'PHUL – Power Hypertrophy Upper Lower',
  description: 'Upper/lower split combining strength and hypertrophy.',
  createdAt: new Date(),
  updatedAt: new Date(),
  days: [
    {
      id: nanoid(),
      name: 'Upper Power',
      order: 1,
      plannedSets: [
        {
          id: nanoid(),
          exerciseId: 'bench_press',
          targetReps: 5,
          restSeconds: 180,
          order: 1,
        },
        {
          id: nanoid(),
          exerciseId: 'barbell_row',
          targetReps: 5,
          restSeconds: 180,
          order: 2,
        },
        {
          id: nanoid(),
          exerciseId: 'overhead_press',
          targetReps: 5,
          restSeconds: 150,
          order: 3,
        },
        {
          id: nanoid(),
          exerciseId: 'pull_up',
          targetReps: 8,
          restSeconds: 120,
          order: 4,
        },
      ],
    },
    {
      id: nanoid(),
      name: 'Lower Power',
      order: 2,
      plannedSets: [
        {
          id: nanoid(),
          exerciseId: 'back_squat',
          targetReps: 5,
          restSeconds: 180,
          order: 1,
        },
        {
          id: nanoid(),
          exerciseId: 'deadlift',
          targetReps: 5,
          restSeconds: 240,
          order: 2,
        },
        {
          id: nanoid(),
          exerciseId: 'leg_press',
          targetReps: 8,
          restSeconds: 120,
          order: 3,
        },
        {
          id: nanoid(),
          exerciseId: 'standing_calf_raise',
          targetReps: 12,
          restSeconds: 90,
          order: 4,
        },
      ],
    },
    {
      id: nanoid(),
      name: 'Upper Hypertrophy',
      order: 3,
      plannedSets: [
        {
          id: nanoid(),
          exerciseId: 'incline_bench_press',
          targetReps: 12,
          restSeconds: 90,
          order: 1,
        },
        {
          id: nanoid(),
          exerciseId: 'lat_pulldown',
          targetReps: 12,
          restSeconds: 90,
          order: 2,
        },
        {
          id: nanoid(),
          exerciseId: 'lateral_raise',
          targetReps: 15,
          restSeconds: 60,
          order: 3,
        },
        {
          id: nanoid(),
          exerciseId: 'chest_fly',
          targetReps: 15,
          restSeconds: 60,
          order: 4,
        },
      ],
    },
    {
      id: nanoid(),
      name: 'Lower Hypertrophy',
      order: 4,
      plannedSets: [
        {
          id: nanoid(),
          exerciseId: 'front_squat',
          targetReps: 12,
          restSeconds: 120,
          order: 1,
        },
        {
          id: nanoid(),
          exerciseId: 'romanian_deadlift',
          targetReps: 12,
          restSeconds: 120,
          order: 2,
        },
        {
          id: nanoid(),
          exerciseId: 'leg_curl',
          targetReps: 15,
          restSeconds: 90,
          order: 3,
        },
        {
          id: nanoid(),
          exerciseId: 'seated_calf_raise',
          targetReps: 20,
          restSeconds: 60,
          order: 4,
        },
      ],
    },
  ],
}

export const redditPPL: WorkoutRoutine = {
  id: nanoid(),
  name: 'Reddit Push Pull Legs',
  description: 'Classic PPL hypertrophy routine from r/Fitness.',
  createdAt: new Date(),
  updatedAt: new Date(),
  days: [
    {
      id: nanoid(),
      name: 'Push',
      order: 1,
      plannedSets: [
        {
          id: nanoid(),
          exerciseId: 'bench_press',
          targetReps: 8,
          restSeconds: 150,
          order: 1,
        },
        {
          id: nanoid(),
          exerciseId: 'overhead_press',
          targetReps: 10,
          restSeconds: 120,
          order: 2,
        },
        {
          id: nanoid(),
          exerciseId: 'incline_bench_press',
          targetReps: 12,
          restSeconds: 90,
          order: 3,
        },
        {
          id: nanoid(),
          exerciseId: 'lateral_raise',
          targetReps: 15,
          restSeconds: 60,
          order: 4,
        },
        {
          id: nanoid(),
          exerciseId: 'triceps_pushdown',
          targetReps: 15,
          restSeconds: 60,
          order: 5,
        },
      ],
    },
    {
      id: nanoid(),
      name: 'Pull',
      order: 2,
      plannedSets: [
        {
          id: nanoid(),
          exerciseId: 'deadlift',
          targetReps: 5,
          restSeconds: 240,
          order: 1,
        },
        {
          id: nanoid(),
          exerciseId: 'pull_up',
          targetReps: 10,
          restSeconds: 120,
          order: 2,
        },
        {
          id: nanoid(),
          exerciseId: 'barbell_row',
          targetReps: 12,
          restSeconds: 120,
          order: 3,
        },
        {
          id: nanoid(),
          exerciseId: 'face_pull',
          targetReps: 15,
          restSeconds: 60,
          order: 4,
        },
        {
          id: nanoid(),
          exerciseId: 'barbell_curl',
          targetReps: 12,
          restSeconds: 60,
          order: 5,
        },
      ],
    },
    {
      id: nanoid(),
      name: 'Legs',
      order: 3,
      plannedSets: [
        {
          id: nanoid(),
          exerciseId: 'back_squat',
          targetReps: 8,
          restSeconds: 180,
          order: 1,
        },
        {
          id: nanoid(),
          exerciseId: 'romanian_deadlift',
          targetReps: 10,
          restSeconds: 150,
          order: 2,
        },
        {
          id: nanoid(),
          exerciseId: 'leg_press',
          targetReps: 15,
          restSeconds: 120,
          order: 3,
        },
        {
          id: nanoid(),
          exerciseId: 'leg_curl',
          targetReps: 15,
          restSeconds: 90,
          order: 4,
        },
        {
          id: nanoid(),
          exerciseId: 'standing_calf_raise',
          targetReps: 20,
          restSeconds: 60,
          order: 5,
        },
      ],
    },
  ],
}

export const bodyweightRR: WorkoutRoutine = {
  id: nanoid(),
  name: 'Bodyweight Recommended Routine',
  description: 'Full-body calisthenics routine from r/bodyweightfitness.',
  createdAt: new Date(),
  updatedAt: new Date(),
  days: [
    {
      id: nanoid(),
      name: 'Full Body',
      order: 1,
      plannedSets: [
        {
          id: nanoid(),
          exerciseId: 'push_up',
          targetReps: 15,
          restSeconds: 90,
          order: 1,
        },
        {
          id: nanoid(),
          exerciseId: 'pull_up',
          targetReps: 8,
          restSeconds: 120,
          order: 2,
        },
        {
          id: nanoid(),
          exerciseId: 'goblet_squat',
          targetReps: 15,
          restSeconds: 120,
          order: 3,
        },
        {
          id: nanoid(),
          exerciseId: 'hip_thrust',
          targetReps: 15,
          restSeconds: 90,
          order: 4,
        },
        {
          id: nanoid(),
          exerciseId: 'plank',
          targetReps: 60,
          restSeconds: 60,
          order: 5,
        },
      ],
    },
  ],
}

export const DEFAULT_ROUTINES: Array<WorkoutRoutine> = [
  beginnerLP,
  phul,
  redditPPL,
  bodyweightRR,
]
