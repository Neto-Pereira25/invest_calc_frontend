import { create } from 'zustand';
import { api } from '../lib/api';
import { createTransaction, deleteTransaction, updateTransaction } from '../lib/transactionService';

export interface CreateTransactionDTO {
    description: string;
    amount: number;
    date: string;
    subcategoryId: number;
}

interface Transaction {
    id: number;
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    subcategory: string;
    date: string;
}

interface TransactionsState {
    items: Transaction[];
    isLoading: boolean;
    fetchTransactions: () => Promise<void>;
    addTransaction: (data: CreateTransactionDTO) => Promise<void>;
    updateTransaction: (id: number, data: CreateTransactionDTO) => Promise<void>;
    removeTransaction: (id: number) => Promise<void>;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
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

    addTransaction: async (data) => {
        try {
            await createTransaction(data);

            // 🔥 atualiza lista depois de criar
            await get().fetchTransactions();
        } catch (error) {
            console.error('Erro ao criar transação', error);
        }
    },

    updateTransaction: async (id, data) => {
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