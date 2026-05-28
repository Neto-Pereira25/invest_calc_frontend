export interface Goal {
    id: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    progressPercentage: number;
    deadline: string;
    status: 'ACTIVE' | 'COMPLETED' | 'OVERDUE';
    createdAt: string;
}

export interface CreateGoalDTO {
    name: string;
    targetAmount: number;
    deadline: string;
}