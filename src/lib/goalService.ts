import { api } from './api';
import type { CreateGoalDTO, Goal } from '../types/goal';

interface ApiResponse<T> {
    data: T;
    message: string;
}

export async function getGoals(): Promise<Goal[]> {
    const response = await api.get<ApiResponse<Goal[]>>('/goals');

    return response.data.data;
}

export async function createGoal(payload: CreateGoalDTO): Promise<Goal> {
    const response = await api.post<ApiResponse<Goal>>('/goals', payload);

    return response.data.data;
}