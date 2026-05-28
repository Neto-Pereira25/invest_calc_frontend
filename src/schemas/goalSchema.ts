import { z } from 'zod';

export const goalSchema = z.object({
    name: z
        .string()
        .min(3, 'O nome deve ter no mínimo 3 caracteres')
        .max(100, 'O nome deve ter no máximo 100 caracteres'),

    targetAmount: z
        .number({
            message: 'Informe um valor válido'
        })
        .positive('O valor deve ser maior que zero'),

    deadline: z
        .string()
        .min(1, 'A data limite é obrigatória')
});

export type GoalFormData = z.infer<typeof goalSchema>;