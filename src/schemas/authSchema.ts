import { z } from 'zod';

export const loginSchema = z.object({
    email: z
        .email({ message: 'E-mail inválido' })
        .min(1, { message: 'E-mail é obrigatório' }),

    password: z
        .string()
        .min(8, { message: 'A senha deve possuir pelo menos 8 caracteres' }),
});

export const registerSchema = z
    .object({
        name: z
            .string()
            .min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
        email: z
            .email({ message: 'E-mail inválido' }),
        password: z.string().min(8, { message: 'Senha deve ter no mínimo 8 caracteres' }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'As senhas não coincidem',
        path: ['confirmPassword'],
    });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
