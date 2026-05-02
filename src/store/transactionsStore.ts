import { create } from 'zustand';
import { api } from '../lib/api';
import { createTransaction } from '../lib/transactionService';

// export type Transaction = {
//     id: number;
//     description: string;
//     amount: number;
//     type: 'INCOME' | 'EXPENSE';
//     category: string;
//     subcategory: string;
//     date: string;
// };

// type TransactionsState = {
//     items: Transaction[];
//     isLoading: boolean;

//     fetchTransactions: () => Promise<void>;
//     clear: () => void;
// };

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

    clear: () => set({ items: [] }),
}));