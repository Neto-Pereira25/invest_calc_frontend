import { api } from '../lib/api';

import type {
    SpendingLimit,
    CreateSpendingLimitDTO,
    UpdateSpendingLimitDTO
} from '../types/spendingLimit';

interface ApiResponse<T> {
    data: T;
    message: string;
}

export async function getSpendingLimit():
    Promise<SpendingLimit | null> {

    const response =
        await api.get<ApiResponse<SpendingLimit | null>>(
            '/spending-limit'
        );

    return response.data.data;
}

export async function createSpendingLimit(
    payload: CreateSpendingLimitDTO
): Promise<SpendingLimit> {

    const response =
        await api.post<ApiResponse<SpendingLimit>>(
            '/spending-limit',
            payload
        );

    return response.data.data;
}

export async function updateSpendingLimit(
    payload: UpdateSpendingLimitDTO
): Promise<SpendingLimit> {

    const response =
        await api.put<ApiResponse<SpendingLimit>>(
            '/spending-limit',
            payload
        );

    return response.data.data;
}

export async function deleteSpendingLimit():
    Promise<void> {

    await api.delete('/spending-limit');
}