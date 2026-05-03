export interface SimulationRequest {
    initialValue: number;
    monthlyContribution: number;
    interestRate: number;
    period: number;
    periodType: 'MONTHLY' | 'ANNUAL';
    rateType: 'MONTHLY' | 'YEARLY';
}

export interface MonthlyBreakdown {
    month: number;
    invested: number;
    interest: number;
    totalInterest: number;
    accumulated: number;
}

export interface SimulationResponse {
    totalInvested: number;
    totalInterest: number;
    finalAmount: number;
    monthlyBreakdown: MonthlyBreakdown[];
}