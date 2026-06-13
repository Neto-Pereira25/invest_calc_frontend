import type { PeriodType, RateInputType, RateType } from './retirementSimulator';

export const ReverseSimulationMode = {
    CALCULATE_CONTRIBUTION: 'CALCULATE_CONTRIBUTION',
    CALCULATE_PERIOD: 'CALCULATE_PERIOD',
} as const;

export interface ReverseSimulationRequest {
    targetAmount: number;
    interestRate: number;
    rateType: keyof typeof RateType;
    interestRateInputType?: keyof typeof RateInputType;
    mode: keyof typeof ReverseSimulationMode;
    // CALCULATE_CONTRIBUTION
    period?: number;
    periodType?: keyof typeof PeriodType;
    // CALCULATE_PERIOD
    monthlyContribution?: number;
}

export interface ReverseSimulationResponse {
    mode: keyof typeof ReverseSimulationMode;
    targetAmount: number;
    usedMonthlyRatePercent: number;
    // CALCULATE_CONTRIBUTION
    informedPeriod: number | null;
    informedPeriodType: keyof typeof PeriodType | null;
    requiredMonthlyContribution: number | null;
    // CALCULATE_PERIOD
    informedMonthlyContribution: number | null;
    requiredPeriodMonths: number | null;
    requiredPeriodYears: number | null;
}
