import { create } from 'zustand';

import { getFinancialSummary } from '../lib/financialSummaryService';

import type { FinancialSummary } from '../types/financialSummary';

type FinancialSummaryState = {
    financialSummary: FinancialSummary | null;
    isLoading: boolean;
    isDismissed: boolean;
    fetchFinancialSummary: () => Promise<void>;
    dismissAlert: () => void;
};

export const useFinancialSummaryStore = create<FinancialSummaryState>((set) => ({
    financialSummary: null,
    isLoading: false,
    isDismissed: false,

    fetchFinancialSummary: async () => {
        set({ isLoading: true });

        try {
            const summary = await getFinancialSummary();

            set({
                financialSummary: summary,
                isDismissed: false,
            });
        } catch (error) {
            console.error('Erro ao buscar resumo financeiro', error);
            set({ financialSummary: null });
        } finally {
            set({ isLoading: false });
        }
    },

    dismissAlert: () => set({ isDismissed: true }),
}));