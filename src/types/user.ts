export const Role = {
    ADMIN: 'ADMIN',
    USER: 'USER',
} as const;

export type Role = typeof Role[keyof typeof Role];

export type User = {
    id: number;
    name: string;
    email: string;
    password?: string;
    role: Role;
};
