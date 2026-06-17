export interface ScenarioInput {
    name: string;
    initialCapital: number;
    monthlyContribution: number;
    interestRate: number;
    months: number;
}

export interface CompareScenariosRequest {
    scenarios: ScenarioInput[];
}

export interface ScenarioComparisonResult {
    scenarioName: string;
    investedAmount: number;
    totalInterest: number;
    finalAmount: number;
}
