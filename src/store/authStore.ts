import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
    token: string | null;
    refreshToken: string | null;

    setAuth: (token: string, refreshToken: string) => void;
    logout: () => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            refreshToken: null,

            setAuth: (token, refreshToken) =>
                set({
                    token,
                    refreshToken,
                }),

            logout: () =>
                set({
                    token: null,
                    refreshToken: null,
                }),
        }),
        {
            name: 'auth-storage'
        }
    )
);