export interface MuscleGroup {
    id: string;
    name: string;
    category: 'push' | 'pull' | 'legs' | 'core';
}
export interface MuscleContribution {
    muscleGroupId: string;
    percentage: number; // 0-100, all contributions for an exercise should sum to 100
}

export interface Exercise {
    id: string;
    name: string;
    description?: string;
    muscleContributions: Array<MuscleContribution>;
    videos?: Array<string>;
    notes?: string;
}
