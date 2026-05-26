import { z } from 'zod';

export const transactionSchema = z.object({
    description: z
        .string()
        .min(1, { message: 'Descrição é obrigatória' })
        .max(255, { message: 'Descrição não pode ter mais de 255 caracteres' }),
    amount: z
        .number({
            message: 'Valor deve ser um número',
        })
        .positive({ message: 'Valor deve ser maior que zero' }),
    date: z
        .string()
        .min(1, { message: 'Data é obrigatória' })
        .refine(
            (date) => !isNaN(Date.parse(date)),
            { message: 'Data inválida' }
        ),
    subcategoryId: z
        .number()
        .int()
        .positive({ message: 'Subcategoria é obrigatória' }),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
