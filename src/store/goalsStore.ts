import { create } from 'zustand';
import { toast } from 'react-toastify';
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

    updateGoalProgress: (
        id: number,
        currentAmount: number
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

            toast.success(
                'Meta criada com sucesso!'
            );

            await get().fetchGoals();
        } catch (error) {
            console.error(
                'Erro ao criar meta:',
                error
            );

            toast.error(
                'Erro ao criar meta.'
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

            toast.success(
                'Meta atualizada com sucesso!'
            );

            await get().fetchGoals();
        } catch (error) {
            console.error(
                'Erro ao atualizar meta:',
                error
            );

            toast.error(
                'Erro ao atualizar meta.'
            );

            throw error;
        }
    },

    deleteGoal: async (id) => {
        try {
            await goalService.deleteGoal(id);

            toast.success(
                'Meta removida com sucesso!'
            );

            await get().fetchGoals();
        } catch (error) {
            console.error(
                'Erro ao excluir meta:',
                error
            );

            toast.error(
                'Erro ao excluir meta.'
            );

            throw error;
        }
    },

    updateGoalProgress: async (
        id,
        currentAmount
    ) => {
        try {
            if (currentAmount < 0) {
                toast.error(
                    'O valor atual não pode ser negativo.'
                );
                return;
            }

            await goalService.updateGoalProgress(
                id,
                { currentAmount }
            );

            toast.success(
                'Progresso atualizado!'
            );

            await get().fetchGoals();
        } catch (error) {
            console.error(
                'Erro ao atualizar progresso:',
                error
            );

            toast.error(
                'Erro ao atualizar progresso.'
            );

            throw error;
        }
    },
})
);
