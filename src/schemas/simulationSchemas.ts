import z from 'zod';

export const simulationSchema = z.object({
    initialInvestment: z
        .number({
            message: 'Valor inicial deve ser um número',
        })
        .positive({ message: 'Valor inicial deve ser maior que zero' }),

    monthlyContribution: z
        .number({
            message: 'Aporte mensal deve ser um número',
        })
        .min(0, { message: 'Aporte mensal deve ser maior ou igual a zero' }),

    interestRate: z
        .number({
            message: 'Taxa de juros deve ser um número',
        })
        .min(0, { message: 'Taxa de juros deve ser maior ou igual a zero' }),

    period: z
        .number({
            message: 'Período deve ser um número',
        })
        .int({ message: 'Período deve ser um número inteiro' })
        .positive({ message: 'Período deve ser maior que zero' }),

    periodType: z
        .enum(['MONTHS', 'ANNUAL'], { message: 'Tipo de período inválido' }),

    rateType: z
        .enum(['MONTHLY', 'YEARLY'], { message: 'Tipo de taxa inválido' }),
});

export type SimulationInput = z.infer<typeof simulationSchema>;
