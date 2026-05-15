import { api } from './api';
import type { User } from '../types/user';

export async function getUserProfile(): Promise<User> {
    const response = await api.get('/users/profile');
    return response.data;
}

export async function updateAuthenticatedUserName(name: string): Promise<User> {
    const response = await api.patch('/profile', { name });
    return response.data;
}

export async function updateUserProfile(user: Partial<User>): Promise<User> {
    const response = await api.put('/users/profile', user);
    return response.data;
}
