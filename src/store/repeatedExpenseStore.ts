import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RepeatedExpense } from '../types/repeatedExpense';
import { getRepeatedExpenses } from '../lib/repeatedExpenseService';
import { errorToast } from '../components/ui/toast';

export type RepeatedExpenseState = {
    items: RepeatedExpense[];
    isLoading: boolean;
    fetchRepeatedExpenses: () => Promise<void>;
};

export const useRepeatedExpenseStore = create<RepeatedExpenseState>()(
    persist(
        (set) => ({
            items: [],
            isLoading: false,

            fetchRepeatedExpenses: async () => {
                set({ isLoading: true });
                try {
                    const data = await getRepeatedExpenses();
                    set({ items: data });
                } catch (error) {
                    errorToast('Erro ao carregar gastos recorrentes');
                    console.error(error);
                } finally {
                    set({ isLoading: false });
                }
            },
        }),
        { name: 'repeated-expense-storage' }
    )
);
