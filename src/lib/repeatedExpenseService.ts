import { api } from './api';
import type { RepeatedExpense } from '../types/repeatedExpense';

export async function getRepeatedExpenses(): Promise<RepeatedExpense[]> {
    const response = await api.get('/financial-transactions/recurring-expenses');
    return response.data.data;
}
