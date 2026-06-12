export type FinancialProfileName =
    | 'DEVEDOR'
    | 'GASTADOR'
    | 'DESLIGADO'
    | 'POUPADOR'
    | 'INVESTIDOR';

export type FinancialProfileOption = 'A' | 'B' | 'C' | 'D' | 'E';

export interface FinancialProfileAnswerRequest {
    questionNumber: number;
    selectedOption: FinancialProfileOption;
}

export interface FinancialProfileRequest {
    answers: FinancialProfileAnswerRequest[];
}

export interface FinancialProfileResponse {
    profile: FinancialProfileName;
    description: string;
    strengths: string[];
    limitations: string[];
    recommendations: string[];
    suggestedGoals: string[];
    devedorScore: number;
    gastadorScore: number;
    desligadoScore: number;
    poupadorScore: number;
    investidorScore: number;
    devedorPercentage: number;
    gastadorPercentage: number;
    desligadoPercentage: number;
    poupadorPercentage: number;
    investidorPercentage: number;
    assessedAt: string;
}

export interface FinancialProfileHistoryItem {
    id: number;
    profile: FinancialProfileName;
    assessedAt: string;
}