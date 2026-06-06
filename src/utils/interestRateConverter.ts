import type {
    RateConversionInput,
    RateConversionResult,
    RateType,
} from '../types/interestRateConverter';

/**
 * Converte uma taxa de juros entre mensal e anual usando a fórmula de
 * taxa equivalente composta.
 *
 * Fórmulas:
 * - Mensal → Anual: (1 + r_m)^12 - 1
 * - Anual → Mensal: (1 + r_a)^(1/12) - 1
 *
 * @param input - Objeto contendo a taxa e a direção de conversão
 * @returns Resultado da conversão com fórmula e valores
 * @throws Error se a taxa for inválida
 */
export function convertInterestRate(input: RateConversionInput): RateConversionResult {
    const { rate, direction } = input;

    if (!Number.isFinite(rate) || rate < 0) {
        throw new Error('Taxa de juros inválida. Deve ser um número não-negativo.');
    }

    // Trabalha com valores decimais (0.05 = 5%, não 5)
    const decimalRate = rate / 100;

    let convertedRate: number;
    let originalType: RateType;
    let convertedType: RateType;
    let formula: string;
    let formulaLatex: string;

    if (direction === 'TO_YEARLY') {
        // Conversão mensal → anual
        originalType = 'MONTHLY';
        convertedType = 'YEARLY';

        // i_a = (1 + i_m)^12 - 1
        convertedRate = Math.pow(1 + decimalRate, 12) - 1;
        formula = `(1 + ${(decimalRate * 100).toFixed(4)}%)^12 - 1`;
        formulaLatex = '(1 + i_m)^{12} - 1';
    } else {
        // Conversão anual → mensal
        originalType = 'YEARLY';
        convertedType = 'MONTHLY';

        // i_m = (1 + i_a)^(1/12) - 1
        convertedRate = Math.pow(1 + decimalRate, 1 / 12) - 1;
        formula = `(1 + ${(decimalRate * 100).toFixed(4)}%)^(1/12) - 1`;
        formulaLatex = '(1 + i_a)^{1/12} - 1';
    }

    // Converte resultado de volta para percentual
    const convertedRatePercent = convertedRate * 100;

    return {
        originalRate: rate,
        originalType,
        convertedRate: convertedRatePercent,
        convertedType,
        direction,
        formula,
        formulaLatex,
    };
}

/**
 * Valida se uma taxa de juros está dentro dos limites aceitáveis
 */
export function isValidRate(rate: number): boolean {
    return Number.isFinite(rate) && rate >= 0 && rate <= 1000;
}

/**
 * Formata uma taxa para exibição em pt-BR com 2-6 casas decimais
 */
export function formatRateForDisplay(rate: number, decimals: number = 4): string {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: decimals,
    }).format(rate);
}

/**
 * Determina quantas casas decimais exibir baseado na magnitude da taxa
 */
export function getOptimalDecimalPlaces(rate: number): number {
    if (rate === 0) return 2;
    if (rate < 0.01) return 6;
    if (rate < 0.1) return 5;
    if (rate < 1) return 4;
    return 3;
}
