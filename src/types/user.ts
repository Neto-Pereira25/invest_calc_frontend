export enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

export type User = {
    id: number;
    name: string;
    email: string;
    password?: string;
    role: Role;
};
