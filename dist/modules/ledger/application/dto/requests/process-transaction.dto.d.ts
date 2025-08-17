import { TransactionType, TransactionSource } from '../../../infrastructure/orm-entities';
export declare class ProcessTransactionDto {
    type: TransactionType;
    amount: number;
    currency: string;
    description: string;
    sourceAccountId?: string;
    destinationAccountId?: string;
    reference?: string;
    externalReference?: string;
    source?: TransactionSource;
    initiatedBy?: string;
    metadata?: Record<string, any>;
}
export declare class ReverseTransactionDto {
    reason: string;
    initiatedBy?: string;
}
