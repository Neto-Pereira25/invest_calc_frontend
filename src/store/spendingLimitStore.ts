import { create } from 'zustand';
import { toast } from 'react-toastify';

import * as spendingLimitService from '../lib/spendingLimitService';

import type {
    SpendingLimit,
    CreateSpendingLimitDTO
} from '../types/spendingLimit';

interface SpendingLimitStore {
    spendingLimit: SpendingLimit | null;

    loading: boolean;

    fetchSpendingLimit: () => Promise<void>;

    createSpendingLimit: (
        payload: CreateSpendingLimitDTO
    ) => Promise<void>;

    updateSpendingLimit: (
        payload: CreateSpendingLimitDTO
    ) => Promise<void>;

    deleteSpendingLimit: () => Promise<void>;
}

export const useSpendingLimitStore =
    create<SpendingLimitStore>(
        (set, get) => ({
            spendingLimit: null,

            loading: false,

            fetchSpendingLimit: async () => {
                set({ loading: true });

                try {
                    const spendingLimit =
                        await spendingLimitService
                            .getSpendingLimit();

                    set({ spendingLimit });
                } catch (error) {
                    console.error(error);
                } finally {
                    set({ loading: false });
                }
            },

            createSpendingLimit:
                async (payload) => {
                    try {
                        await spendingLimitService
                            .createSpendingLimit(payload);

                        toast.success(
                            'Limite criado com sucesso!'
                        );

                        await get()
                            .fetchSpendingLimit();
                    } catch (error) {
                        toast.error(
                            'Erro ao criar limite.'
                        );

                        throw error;
                    }
                },

            updateSpendingLimit:
                async (payload) => {
                    try {
                        await spendingLimitService
                            .updateSpendingLimit(payload);

                        toast.success(
                            'Limite atualizado com sucesso!'
                        );

                        await get()
                            .fetchSpendingLimit();
                    } catch (error) {
                        toast.error(
                            'Erro ao atualizar limite.'
                        );

                        throw error;
                    }
                },

            deleteSpendingLimit:
                async () => {
                    try {
                        await spendingLimitService
                            .deleteSpendingLimit();

                        set({
                            spendingLimit: null
                        });

                        toast.success(
                            'Limite removido com sucesso!'
                        );
                    } catch (error) {
                        toast.error(
                            'Erro ao remover limite.'
                        );

                        throw error;
                    }
                }
        })
    );