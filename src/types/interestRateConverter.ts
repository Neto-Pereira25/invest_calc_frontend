/**
 * Tipos para o conversor de taxa de juros
 */

export type RateType = 'MONTHLY' | 'YEARLY';
export type ConversionDirection = 'TO_MONTHLY' | 'TO_YEARLY';

export interface RateConversionInput {
    rate: number;
    direction: ConversionDirection;
}

export interface RateConversionResult {
    originalRate: number;
    originalType: RateType;
    convertedRate: number;
    convertedType: RateType;
    direction: ConversionDirection;
    formula: string;
    formulaLatex?: string;
}

export interface RateConverterModalProps {
    show: boolean;
    onClose: () => void;
    onApply?: (convertedRate: number, rateType: RateType) => void;
}
