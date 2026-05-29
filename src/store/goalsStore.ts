import { create } from 'zustand';
import * as goalService from '../lib/goalService';
import type { CreateGoalDTO, Goal } from '../types/goal';

interface GoalsStore {
    goals: Goal[];
    loading: boolean;

    fetchGoals: () => Promise<void>;

    createGoal: (
        payload: CreateGoalDTO
    ) => Promise<void>;

    updateGoal: (
        id: number,
        payload: CreateGoalDTO
    ) => Promise<void>;

    deleteGoal: (
        id: number
    ) => Promise<void>;
}

export const useGoalsStore = create<GoalsStore>((set, get) => ({
    goals: [],
    loading: false,

    fetchGoals: async () => {
        set({ loading: true });

        try {
            const goals =
                await goalService.getGoals();

            set({ goals });
        } catch (error) {
            console.error(
                'Erro ao buscar metas:',
                error
            );
        } finally {
            set({ loading: false });
        }
    },

    createGoal: async (payload) => {
        try {
            await goalService.createGoal(payload);

            await get().fetchGoals();
        } catch (error) {
            console.error(
                'Erro ao criar meta:',
                error
            );

            throw error;
        }
    },

    updateGoal: async (id, payload) => {
        try {
            await goalService.updateGoal(
                id,
                payload
            );

            await get().fetchGoals();
        } catch (error) {
            console.error(
                'Erro ao atualizar meta:',
                error
            );

            throw error;
        }
    },

    deleteGoal: async (id) => {
        try {
            await goalService.deleteGoal(id);

            await get().fetchGoals();
        } catch (error) {
            console.error(
                'Erro ao excluir meta:',
                error
            );

            throw error;
        }
    }
})
);
