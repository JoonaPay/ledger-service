import { LedgerAccountOrmEntity } from './ledger-account.entity';
import { TransactionOrmEntity } from './transaction.entity';
export declare enum ReconciliationType {
    DAILY = "DAILY",
    MONTHLY = "MONTHLY",
    MANUAL = "MANUAL",
    EXTERNAL_BLNK = "EXTERNAL_BLNK",
    BANK_STATEMENT = "BANK_STATEMENT"
}
export declare enum ReconciliationStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    RECONCILED = "RECONCILED",
    FAILED = "FAILED",
    MANUAL_REVIEW = "MANUAL_REVIEW"
}
export declare enum ResolutionAction {
    NO_ACTION = "NO_ACTION",
    ADJUSTMENT_MADE = "ADJUSTMENT_MADE",
    EXTERNAL_CORRECTION = "EXTERNAL_CORRECTION",
    PENDING_INVESTIGATION = "PENDING_INVESTIGATION"
}
export declare enum BlnkSyncStatus {
    SYNCED = "SYNCED",
    OUT_OF_SYNC = "OUT_OF_SYNC",
    ERROR = "ERROR",
    NOT_APPLICABLE = "NOT_APPLICABLE"
}
export declare class ReconciliationLogOrmEntity {
    id: string;
    accountId: string;
    reconciliationDate: Date;
    reconciliationType: ReconciliationType;
    externalSource?: string;
    internalBalance: number;
    externalBalance: number;
    varianceAmount: number;
    variancePercentage: number;
    currency: string;
    status: ReconciliationStatus;
    reconciledBy?: string;
    reconciledAt?: Date;
    varianceReason?: string;
    resolutionNotes?: string;
    resolutionAction?: ResolutionAction;
    adjustmentTransactionId?: string;
    externalReference?: string;
    blnkAccountId?: string;
    blnkBalance?: number;
    blnkSyncStatus: BlnkSyncStatus;
    transactionCountInternal: number;
    transactionCountExternal?: number;
    lastTransactionId?: string;
    reconciliationWindowStart?: Date;
    reconciliationWindowEnd?: Date;
    toleranceAmount: number;
    isWithinTolerance: boolean;
    requiresAttention: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    account: LedgerAccountOrmEntity;
    adjustmentTransaction?: TransactionOrmEntity;
    lastTransaction?: TransactionOrmEntity;
}
