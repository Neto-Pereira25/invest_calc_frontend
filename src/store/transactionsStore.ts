import { create } from 'zustand';
import { api } from '../lib/api';

export type Transaction = {
    id: number;
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    subcategory: string;
    date: string;
};

type TransactionsState = {
    items: Transaction[];
    isLoading: boolean;

    fetchTransactions: () => Promise<void>;
    clear: () => void;
};

export const useTransactionsStore = create<TransactionsState>((set) => ({
    items: [],
    isLoading: false,

    fetchTransactions: async () => {
        set({ isLoading: true });

        try {
            const response = await api.get('/financial-transactions');

            const data = response.data.data;

            set({ items: data });
        } catch (error) {
            console.error('Erro ao buscar transações', error);
        } finally {
            set({ isLoading: false });
        }
    },

    clear: () => set({ items: [] }),
}));