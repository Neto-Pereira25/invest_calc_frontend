import { z } from 'zod';

const PasswordSchema = z
    .string()
    .min(8, { message: 'Senha deve ter no mínimo 8 caracteres' });

export const LoginSchema = z.object({
    email: z.string().email({ message: 'E-mail inválido' }),
    password: z.string().min(6, { message: 'Senha obrigatória' }),
});

export const RegisterSchema = z
    .object({
        name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
        email: z.string().email({ message: 'E-mail inválido' }),
        password: PasswordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'As senhas não coincidem',
        path: ['confirmPassword'],
    });

export const ForgotPasswordSchema = z.object({
    email: z.string().email({ message: 'E-mail inválido' }),
});

export const ResetPasswordSchema = z
    .object({
        token: z.string().min(1, { message: 'Token é obrigatório' }),
        password: PasswordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'As senhas não coincidem',
        path: ['confirmPassword'],
    });

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
