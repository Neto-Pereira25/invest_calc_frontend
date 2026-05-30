import { api } from './api';
import type { CreateGoalDTO, UpdateGoalProgressDTO, Goal } from '../types/goal';

interface ApiResponse<T> {
    data: T;
    message: string;
}

export async function getGoals(): Promise<Goal[]> {
    const response = await api.get<ApiResponse<Goal[]>>(
        '/goals'
    );

    return response.data.data;
}

export async function createGoal(payload: CreateGoalDTO): Promise<Goal> {
    const response = await api.post<ApiResponse<Goal>>(
        '/goals',
        payload
    );

    return response.data.data;
}

export async function updateGoal(id: number, payload: CreateGoalDTO): Promise<Goal> {
    const response = await api.put<ApiResponse<Goal>>(
        `/goals/${id}`,
        payload
    );

    return response.data.data;
}

export async function deleteGoal(id: number): Promise<void> {
    await api.delete(`/goals/${id}`);
}

export async function updateGoalProgress(
    id: number,
    payload: UpdateGoalProgressDTO
): Promise<Goal> {
    const response = await api.patch<ApiResponse<Goal>>(
        `/goals/${id}/progress`,
        payload
    );

    return response.data.data;
}
