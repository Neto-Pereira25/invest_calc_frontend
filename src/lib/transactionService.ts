import { api } from './api';

export interface CreateTransactionDTO {
    description: string;
    amount: number;
    date: string;
    subcategoryId: number;
}

export async function createTransaction(data: CreateTransactionDTO) {
    const response = await api.post('/financial-transactions', data);
    return response.data;
}