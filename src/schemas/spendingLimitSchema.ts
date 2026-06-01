import { z } from 'zod';

export const spendingLimitSchema = z.object({
    amount: z
        .number({
            message: 'Informe o limite mensal'
        })
        .positive('O limite deve ser maior que zero')
});

export type SpendingLimitFormData =
    z.infer<typeof spendingLimitSchema>;