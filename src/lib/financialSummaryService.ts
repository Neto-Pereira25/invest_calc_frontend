import { api } from './api';

import type { FinancialSummary } from '../types/financialSummary';

interface ApiResponse<T> {
    data: T;
    message: string;
}

export async function getFinancialSummary(): Promise<FinancialSummary> {
    const response = await api.get<ApiResponse<FinancialSummary>>('/users/financial-summary');

    return response.data.data;
}