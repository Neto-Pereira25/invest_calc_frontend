export interface SpendingLimit {
    id: number;
    amount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSpendingLimitDTO {
    amount: number;
}

export interface UpdateSpendingLimitDTO {
    amount: number;
}