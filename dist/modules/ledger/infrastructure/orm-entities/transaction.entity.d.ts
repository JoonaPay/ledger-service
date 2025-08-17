import { LedgerAccountOrmEntity } from './ledger-account.entity';
import { TransactionEntryOrmEntity } from './transaction-entry.entity';
export declare enum TransactionType {
    DEPOSIT = "DEPOSIT",
    WITHDRAWAL = "WITHDRAWAL",
    TRANSFER = "TRANSFER",
    FEE = "FEE",
    INTEREST = "INTEREST",
    ADJUSTMENT = "ADJUSTMENT"
}
export declare enum TransactionStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    REVERSED = "REVERSED"
}
export declare enum TransactionSource {
    INTERNAL = "INTERNAL",
    BANK_TRANSFER = "BANK_TRANSFER",
    CARD = "CARD",
    CRYPTO = "CRYPTO",
    WIRE = "WIRE",
    ACH = "ACH",
    API = "API"
}
export declare enum ComplianceStatus {
    CLEAN = "CLEAN",
    FLAGGED = "FLAGGED",
    UNDER_REVIEW = "UNDER_REVIEW",
    BLOCKED = "BLOCKED"
}
export declare class TransactionOrmEntity {
    id: string;
    accountId: string;
    transactionReference: string;
    transactionType: TransactionType;
    amount: number;
    currency: string;
    description?: string;
    counterpartyAccountId?: string;
    counterpartyName?: string;
    counterpartyIdentifier?: string;
    blnkTransactionId?: string;
    externalReference?: string;
    source: TransactionSource;
    status: TransactionStatus;
    balanceBefore: number;
    balanceAfter: number;
    feeAmount: number;
    exchangeRate?: number;
    originalAmount?: number;
    originalCurrency?: string;
    settlementDate?: Date;
    valueDate: Date;
    authorizationCode?: string;
    riskScore?: number;
    riskFlags?: Record<string, any>;
    complianceStatus: ComplianceStatus;
    metadata?: Record<string, any>;
    processedAt?: Date;
    failedReason?: string;
    reversalTransactionId?: string;
    isReversal: boolean;
    createdAt: Date;
    updatedAt: Date;
    account: LedgerAccountOrmEntity;
    counterpartyAccount?: LedgerAccountOrmEntity;
    entries: TransactionEntryOrmEntity[];
}
