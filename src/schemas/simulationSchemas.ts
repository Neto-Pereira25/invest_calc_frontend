import { z } from 'zod';

function parseLocaleNumber(value: string): number {
    const sanitized = value
        .trim()
        .replace(/[^\d,.-]/g, '')
        .replace(/(?!^)-/g, '');

    // Se não houver dígitos, retorna NaN
    if (!/[0-9]/.test(sanitized)) {
        return NaN;
    }

    const signal = sanitized.startsWith('-') ? -1 : 1;
    const unsigned = sanitized.replace('-', '');

    const lastComma = unsigned.lastIndexOf(',');
    const lastDot = unsigned.lastIndexOf('.');
    const decimalIndex = Math.max(lastComma, lastDot);

    let normalized: string;

    if (decimalIndex === -1) {
        normalized = unsigned.replace(/[.,]/g, '');
    } else {
        const integerPart = unsigned.slice(0, decimalIndex).replace(/[.,]/g, '');
        const fractionPart = unsigned.slice(decimalIndex + 1).replace(/[,]/g, '.');
        const hasMixedSeparators = lastComma !== -1 && lastDot !== -1;
        const shouldTreatAsThousands = !hasMixedSeparators && fractionPart.length === 3;

        normalized = shouldTreatAsThousands
            ? `${integerPart}${fractionPart}`
            : `${integerPart || '0'}.${fractionPart || '0'}`;
    }

    const parsed = signal * Number(normalized);

    return Number.isFinite(parsed) ? parsed : NaN;
}

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

export const simulationSchema = z.object({
    initialValue: requiredNumberField('Valor inicial é obrigatório', 'Valor inicial deve ser um número')
        .refine((value) => parseLocaleNumber(value) > 0, { message: 'Valor inicial deve ser maior que zero' }),

    monthlyContribution: requiredNumberField('Aporte mensal é obrigatório', 'Aporte mensal deve ser um número')
        .refine((value) => parseLocaleNumber(value) >= 0, { message: 'Aporte mensal deve ser maior ou igual a zero' }),

    interestRate: requiredNumberField('Taxa de juros é obrigatória', 'Taxa de juros deve ser um número')
        .refine((value) => parseLocaleNumber(value) >= 0, { message: 'Taxa de juros deve ser maior ou igual a zero' }),

    period: requiredNumberField('Período é obrigatório', 'Período deve ser um número')
        .refine((value) => parseLocaleNumber(value) > 0, { message: 'Período deve ser maior que zero' }),

    periodType: z
        .enum(['ANNUAL', 'MONTHLY'], { message: 'Tipo de período inválido' }),

    rateType: z
        .enum(['YEARLY', 'MONTHLY'], { message: 'Tipo de taxa inválido' }),
});

export type SimulationFormData = z.infer<typeof simulationSchema>;
export { parseLocaleNumber };
