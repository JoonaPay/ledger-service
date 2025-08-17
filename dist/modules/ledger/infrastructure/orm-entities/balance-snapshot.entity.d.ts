import { LedgerAccountOrmEntity } from './ledger-account.entity';
export declare enum SnapshotType {
    DAILY = "DAILY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY",
    MANUAL = "MANUAL",
    RECONCILIATION = "RECONCILIATION"
}
export declare class BalanceSnapshotOrmEntity {
    id: string;
    accountId: string;
    snapshotDate: Date;
    snapshotTime: Date;
    openingBalance: number;
    closingBalance: number;
    totalDebits: number;
    totalCredits: number;
    transactionCount: number;
    currency: string;
    snapshotType: SnapshotType;
    isReconciled: boolean;
    reconciledAt?: Date;
    reconciledBy?: string;
    varianceAmount: number;
    varianceReason?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    account: LedgerAccountOrmEntity;
}
