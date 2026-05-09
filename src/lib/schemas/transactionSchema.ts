import { z } from 'zod';

export const CreateTransactionSchema = z.object({
    description: z
        .string()
        .min(1, { message: 'Descrição é obrigatória' })
        .max(255, { message: 'Descrição não pode ter mais de 255 caracteres' }),
    amount: z
        .number()
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
        .positive({ message: 'Categoria é obrigatória' }),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
