import { z } from 'zod';

export const rateConversionSchema = z.object({
    rate: z
        .number({ message: 'A taxa deve ser um número' })
        .min(0, { message: 'A taxa não pode ser negativa' })
        .max(1000, { message: 'A taxa não pode ser maior que 1000%' })
        .finite({ message: 'A taxa deve ser um número válido' }),
    direction: z.enum(['TO_MONTHLY', 'TO_YEARLY'], {
        message: 'Escolha uma direção de conversão válida',
    }),
});

export type RateConversionFormData = z.infer<typeof rateConversionSchema>;
