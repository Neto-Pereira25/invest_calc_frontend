import { create } from 'zustand';
import {
    createTransaction,
    deleteTransaction,
    getTransactions,
    updateTransaction
} from '../lib/transactionService';
import type { CreateTransactionPayload, Transaction } from '../types/transaction';

interface TransactionsState {
    items: Transaction[];
    isLoading: boolean;

    fetchTransactions: () => Promise<void>;
    addTransaction: (data: CreateTransactionPayload) => Promise<void>;
    editTransaction: (id: number, data: CreateTransactionPayload) => Promise<void>;
    removeTransaction: (id: number) => Promise<void>;
}

export class TransactionError extends Error {
    public errors: string[];

    constructor(message: string, errors: string[] = []) {
        super(message);
        this.name = 'TransactionError';
        this.errors = errors;
    }
}

export const useTransactionsStore = create<TransactionsState>((set) => ({
    items: [],
    isLoading: false,

    fetchTransactions: async () => {
        set({ isLoading: true });

        try {
            const response = await getTransactions();

            set({ items: response.data });
        } catch (error) {
            console.error('Erro ao buscar transações', error);
        } finally {
            set({ isLoading: false });
        }
    },

    addTransaction: async (data) => {
        try {
            await createTransaction(data);

            const res = await getTransactions();
            set({ items: res.data });
        } catch (error) {
            const response = (error as any)?.response?.data;
            const errorMessage = response?.message || 'Erro ao criar transação';
            const errorList = Array.isArray(response?.data) ? response.data : [];
            throw new TransactionError(errorMessage, errorList);
        }
    },

    editTransaction: async (id, data) => {
        try {
            await updateTransaction(id, data);

            const res = await getTransactions();
            set({ items: res.data });
        } catch (error) {
            const response = (error as any)?.response?.data;
            const errorMessage = response?.message || 'Erro ao editar transação';
            const errorList = Array.isArray(response?.data) ? response.data : [];
            throw new TransactionError(errorMessage, errorList);
        }
    },

    removeTransaction: async (id) => {
        await deleteTransaction(id);

        set((state) => ({
            items: state.items.filter((t) => t.id !== id),
        }));
    },

    clear: () => set({ items: [] }),
}));