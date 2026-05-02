import { api } from './api';
import type { CreateTransactionPayload, Transaction } from '../types/transaction';

export const getTransactions = async (): Promise<{ data: Transaction[] }> => {
    const res = await api.get('/financial-transactions');
    return res.data;
};

export async function createTransaction(data: CreateTransactionPayload) {
    const response = await api.post('/financial-transactions', data);
    return response.data;
}

export const updateTransaction = async (id: number, data: CreateTransactionPayload) => {
    await api.put(`/financial-transactions/${id}`, data);
};

export const deleteTransaction = async (id: number) => {
    await api.delete(`/financial-transactions/${id}`);
};
