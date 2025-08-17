import { Repository, DataSource } from 'typeorm';
import { LedgerAccountOrmEntity, TransactionEntryOrmEntity, BalanceSnapshotOrmEntity, SnapshotType } from '../../../infrastructure/orm-entities';
export interface AccountBalance {
    accountId: string;
    currentBalance: number;
    availableBalance: number;
    pendingBalance: number;
    totalDebits: number;
    totalCredits: number;
    currency: string;
    lastUpdated: Date;
}
export interface BalanceMovement {
    date: Date;
    openingBalance: number;
    closingBalance: number;
    totalDebits: number;
    totalCredits: number;
    netMovement: number;
    transactionCount: number;
}
export interface BalanceHistory {
    accountId: string;
    currency: string;
    period: {
        start: Date;
        end: Date;
    };
    movements: BalanceMovement[];
    summary: {
        openingBalance: number;
        closingBalance: number;
        totalDebits: number;
        totalCredits: number;
        netMovement: number;
        transactionCount: number;
    };
}
export declare class BalanceService {
    private readonly accountRepository;
    private readonly entryRepository;
    private readonly snapshotRepository;
    private readonly dataSource;
    constructor(accountRepository: Repository<LedgerAccountOrmEntity>, entryRepository: Repository<TransactionEntryOrmEntity>, snapshotRepository: Repository<BalanceSnapshotOrmEntity>, dataSource: DataSource);
    getAccountBalance(accountId: string): Promise<AccountBalance>;
    getMultipleAccountBalances(accountIds: string[]): Promise<AccountBalance[]>;
    getBalanceHistory(accountId: string, startDate: Date, endDate: Date): Promise<BalanceHistory>;
    createBalanceSnapshot(accountId: string, snapshotDate?: Date, snapshotType?: SnapshotType): Promise<string>;
    createSnapshotsForAllAccounts(snapshotDate?: Date, snapshotType?: SnapshotType): Promise<number>;
    recalculateAccountBalance(accountId: string): Promise<void>;
    getBalanceAtDate(accountId: string, date: Date): Promise<number>;
    createDailySnapshots(): Promise<void>;
    private calculateRealTimeBalance;
    private calculateClosingBalance;
    private isSameDay;
}
