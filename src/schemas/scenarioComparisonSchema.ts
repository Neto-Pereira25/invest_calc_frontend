import { z } from 'zod';
import { parseLocaleNumber } from './simulationSchemas';

const requiredNumberField = (requiredMessage: string, invalidMessage: string): z.ZodString => {
    return z
        .string()
        .trim()
        .min(1, { message: requiredMessage })
        .refine((value) => {
            const parsed = parseLocaleNumber(value);
            return value !== '' && !isNaN(parsed);
        }, { message: invalidMessage });
};

const scenarioItemSchema = z.object({
    name: z.string().trim().min(1, { message: 'Nome do cenário é obrigatório' }),
    initialCapital: requiredNumberField(
        'Capital inicial é obrigatório',
        'Capital inicial deve ser um número'
    ).refine((value) => parseLocaleNumber(value) >= 0, {
        message: 'Capital inicial deve ser maior ou igual a zero',
    }),
    monthlyContribution: requiredNumberField(
        'Aporte mensal é obrigatório',
        'Aporte mensal deve ser um número'
    ).refine((value) => parseLocaleNumber(value) >= 0, {
        message: 'Aporte mensal deve ser maior ou igual a zero',
    }),
    interestRate: requiredNumberField(
        'Taxa de juros é obrigatória',
        'Taxa de juros deve ser um número'
    ).refine((value) => parseLocaleNumber(value) > 0, {
        message: 'Taxa de juros deve ser maior que zero',
    }),
    months: requiredNumberField(
        'Meses é obrigatório',
        'Meses deve ser um número'
    ).refine((value) => parseLocaleNumber(value) >= 1, {
        message: 'Meses deve ser no mínimo 1',
    }),
});

export const scenarioComparisonSchema = z.object({
    scenarios: z.array(scenarioItemSchema).min(2, {
        message: 'É necessário informar pelo menos dois cenários',
    }),
});

export type ScenarioComparisonFormData = z.infer<typeof scenarioComparisonSchema>;
