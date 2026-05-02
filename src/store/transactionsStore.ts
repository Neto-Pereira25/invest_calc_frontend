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
            console.error('Erro ao criar transação', error);
        }
    },

    editTransaction: async (id, data) => {
        await updateTransaction(id, data);

        const res = await getTransactions();
        set({ items: res.data });
    },

    removeTransaction: async (id) => {
        await deleteTransaction(id);

        set((state) => ({
            items: state.items.filter((t) => t.id !== id),
        }));
    },

    clear: () => set({ items: [] }),
}));