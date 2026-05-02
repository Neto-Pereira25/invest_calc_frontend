export type TransactionType = 'INCOME' | 'EXPENSE';

export type Transaction = {
    id: number;
    description: string;
    amount: number;
    type: TransactionType;
    category: string;
    subcategory: string;
    date: string;
};

export type CreateTransactionPayload = {
    amount: number;
    description: string;
    date: string;
    subcategoryId: number;
};