import { TransactionOrmEntity } from './transaction.entity';
import { TransactionEntryOrmEntity } from './transaction-entry.entity';
import { BalanceSnapshotOrmEntity } from './balance-snapshot.entity';
import { ReconciliationLogOrmEntity } from './reconciliation-log.entity';
export declare enum AccountType {
    ASSET = "ASSET",
    LIABILITY = "LIABILITY",
    EQUITY = "EQUITY",
    REVENUE = "REVENUE",
    EXPENSE = "EXPENSE"
}
export declare enum AccountStatus {
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    CLOSED = "CLOSED"
}
export declare enum NormalBalance {
    DEBIT = "DEBIT",
    CREDIT = "CREDIT"
}
export declare class LedgerAccountOrmEntity {
    id: string;
    identityAccountId: string;
    userId: string;
    accountName: string;
    accountType: AccountType;
    currency: string;
    balance: number;
    creditBalance: number;
    debitBalance: number;
    blnkAccountId?: string;
    parentAccountId?: string;
    accountLevel: number;
    isContra: boolean;
    normalBalance: NormalBalance;
    metadata?: Record<string, any>;
    status: AccountStatus;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    transactions: TransactionOrmEntity[];
    counterpartyTransactions: TransactionOrmEntity[];
    transactionEntries: TransactionEntryOrmEntity[];
    balanceSnapshots: BalanceSnapshotOrmEntity[];
    reconciliationLogs: ReconciliationLogOrmEntity[];
}
