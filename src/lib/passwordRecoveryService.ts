import { api } from './api';

type ForgotPasswordPayload = {
    email: string;
};

type ResetPasswordPayload = {
    token: string;
    password: string;
};

export async function requestPasswordRecovery(payload: ForgotPasswordPayload) {
    await api.post('/auth/forgot-password', payload);
}

export async function resetPassword(payload: ResetPasswordPayload) {
    await api.post('/auth/reset-password', payload);
}
