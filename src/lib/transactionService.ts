import { api } from './api';

export interface CreateTransactionDTO {
    description: string;
    amount: number;
    date: string;
    subcategoryId: number;
}

export interface UpdateTransactionDTO {
    description: string;
    amount: number;
    date: string;
    subcategoryId: number;
}

export async function createTransaction(data: CreateTransactionDTO) {
    const response = await api.post('/financial-transactions', data);
    return response.data;
}

export const updateTransaction = async (id: number, data: UpdateTransactionDTO) => {
    await api.put(`/financial-transactions/${id}`, data);
};

export const deleteTransaction = async (id: number) => {
    await api.delete(`/financial-transactions/${id}`);
};
