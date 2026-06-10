import { api } from './api';
import type {
    FinancialProfileHistoryItem,
    FinancialProfileRequest,
    FinancialProfileResponse,
} from '../types/financialProfile';

interface ApiResponse<T> {
    data: T;
    message: string;
}

export async function submitFinancialProfileAssessment(
    payload: FinancialProfileRequest,
): Promise<FinancialProfileResponse> {
    const response = await api.post<ApiResponse<FinancialProfileResponse>>(
        '/financial-profile',
        payload,
    );

    return response.data.data;
}

export async function getCurrentFinancialProfile(): Promise<FinancialProfileResponse> {
    const response = await api.get<ApiResponse<FinancialProfileResponse>>('/financial-profile');

    return response.data.data;
}

export async function getFinancialProfileHistory(): Promise<FinancialProfileHistoryItem[]> {
    const response = await api.get<ApiResponse<FinancialProfileHistoryItem[]>>('/financial-profile/history');

    return response.data.data;
}