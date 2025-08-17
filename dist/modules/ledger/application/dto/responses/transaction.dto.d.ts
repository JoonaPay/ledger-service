import { TransactionType, TransactionStatus, TransactionSource, ComplianceStatus } from '../../../infrastructure/orm-entities';
export declare class TransactionEntryDto {
    accountId: string;
    amount: number;
    type: 'debit' | 'credit';
    balanceBefore: number;
    balanceAfter: number;
    description?: string;
}
export declare class TransactionDto {
    id: string;
    transactionReference: string;
    transactionType: TransactionType;
    amount: number;
    currency: string;
    description: string;
    accountId?: string;
    counterpartyAccountId?: string;
    counterpartyName?: string;
    blnkTransactionId?: string;
    externalReference?: string;
    source: TransactionSource;
    status: TransactionStatus;
    balanceBefore: number;
    balanceAfter: number;
    feeAmount?: number;
    exchangeRate?: number;
    settlementDate?: Date;
    valueDate: Date;
    riskScore?: number;
    complianceStatus: ComplianceStatus;
    metadata?: Record<string, any>;
    processedAt?: Date;
    failedReason?: string;
    reversalTransactionId?: string;
    isReversal: boolean;
    createdAt: Date;
    updatedAt: Date;
    entries?: TransactionEntryDto[];
}
export declare class TransactionResultDto {
    transactionId: string;
    reference: string;
    status: TransactionStatus;
    amount: number;
    currency: string;
    sourceAccountId?: string;
    destinationAccountId?: string;
    entries: TransactionEntryDto[];
    metadata?: Record<string, any>;
    processedAt?: Date;
    failedReason?: string;
}
export declare class TransactionSearchResultDto {
    transactions: TransactionDto[];
    total: number;
    limit: number;
    offset: number;
}
