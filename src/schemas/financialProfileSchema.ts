import { z } from 'zod';

const optionSchema = z.enum(['A', 'B', 'C', 'D', 'E']);

export const financialProfileSchema = z.object({
    q1: optionSchema,
    q2: optionSchema,
    q3: optionSchema,
    q4: optionSchema,
    q5: optionSchema,
    q6: optionSchema,
    q7: optionSchema,
    q8: optionSchema,
    q9: optionSchema,
    q10: optionSchema,
});

export type FinancialProfileFormData = z.infer<typeof financialProfileSchema>;