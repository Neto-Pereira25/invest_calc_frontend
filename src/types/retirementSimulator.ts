export const RateType = {
  YEARLY: 'YEARLY',
  MONTHLY: 'MONTHLY',
} as const;

export const RateInputType = {
  DECIMAL: 'DECIMAL',
  PERCENTAGE: 'PERCENTAGE',
} as const;

export const PeriodType = {
  ANNUAL: 'ANNUAL',
  MONTHLY: 'MONTHLY',
} as const;

export interface RetirementSimulatorRequest {
  desiredMonthlyIncome: number;
  interestRate: number;
  period: number;
  periodType: keyof typeof PeriodType;
  rateType: keyof typeof RateType;
  interestRateInputType?: keyof typeof RateInputType;
  annualInflationRate?: number;
  safeWithdrawalRate?: number;
}

export interface RetirementSimulatorResponse {
  desiredMonthlyIncome: number;
  inflationAdjustedMonthlyIncome: number;
  targetAmount: number;
  requiredMonthlyContribution: number;
  usedAnnualInflationRate: number;
  usedSafeWithdrawalRate: number;
  monthsToRetirement: number;
}

export interface RetirementSimulationFormData {
  desiredMonthlyIncome: string;
  interestRate: string;
  period: string;
  periodType: keyof typeof PeriodType;
  rateType: keyof typeof RateType;
  annualInflationRate: string;
  safeWithdrawalRate: string;
}
