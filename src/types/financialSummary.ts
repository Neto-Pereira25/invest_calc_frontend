export interface FinancialSummary {
    monthlyLimit: number;
    monthlyExpenseTotal: number;
    percentageUsed: number;
    isNearLimit: boolean;
    isExceeded: boolean;
}