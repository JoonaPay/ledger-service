import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Decimal } from 'decimal.js';
import { Cron, CronExpression } from '@nestjs/schedule';
import { 
  LedgerAccountOrmEntity, 
  TransactionEntryOrmEntity,
  BalanceSnapshotOrmEntity,
  SnapshotType,
  EntryType,
  AccountType
} from '../../../infrastructure/orm-entities';

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

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(LedgerAccountOrmEntity)
    private readonly accountRepository: Repository<LedgerAccountOrmEntity>,
    @InjectRepository(TransactionEntryOrmEntity)
    private readonly entryRepository: Repository<TransactionEntryOrmEntity>,
    @InjectRepository(BalanceSnapshotOrmEntity)
    private readonly snapshotRepository: Repository<BalanceSnapshotOrmEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Gets real-time account balance
   */
  async getAccountBalance(accountId: string): Promise<AccountBalance> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId, isActive: true },
    });

    if (!account) {
      throw new Error(`Account ${accountId} not found or inactive`);
    }

    // Calculate real-time balance from transaction entries
    const balanceData = await this.calculateRealTimeBalance(accountId);
    
    return {
      accountId,
      currentBalance: balanceData.currentBalance,
      availableBalance: balanceData.availableBalance,
      pendingBalance: balanceData.pendingBalance,
      totalDebits: balanceData.totalDebits,
      totalCredits: balanceData.totalCredits,
      currency: account.currency,
      lastUpdated: new Date(),
    };
  }

  /**
   * Gets balance for multiple accounts
   */
  async getMultipleAccountBalances(accountIds: string[]): Promise<AccountBalance[]> {
    return Promise.all(
      accountIds.map(accountId => this.getAccountBalance(accountId))
    );
  }

  /**
   * Gets balance history for an account over a period
   */
  async getBalanceHistory(
    accountId: string,
    startDate: Date,
    endDate: Date
  ): Promise<BalanceHistory> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }

    // Get daily snapshots for the period
    const snapshots = await this.snapshotRepository.find({
      where: {
        accountId,
        snapshotDate: Between(startDate, endDate),
        snapshotType: SnapshotType.DAILY,
      },
      order: { snapshotDate: 'ASC' },
    });

    const movements: BalanceMovement[] = snapshots.map(snapshot => ({
      date: snapshot.snapshotDate,
      openingBalance: snapshot.openingBalance,
      closingBalance: snapshot.closingBalance,
      totalDebits: snapshot.totalDebits,
      totalCredits: snapshot.totalCredits,
      netMovement: snapshot.closingBalance - snapshot.openingBalance,
      transactionCount: snapshot.transactionCount,
    }));

    // Calculate summary
    const firstSnapshot = snapshots[0];
    const lastSnapshot = snapshots[snapshots.length - 1];
    
    const summary = {
      openingBalance: firstSnapshot?.openingBalance || 0,
      closingBalance: lastSnapshot?.closingBalance || 0,
      totalDebits: snapshots.reduce((sum, s) => sum + s.totalDebits, 0),
      totalCredits: snapshots.reduce((sum, s) => sum + s.totalCredits, 0),
      netMovement: (lastSnapshot?.closingBalance || 0) - (firstSnapshot?.openingBalance || 0),
      transactionCount: snapshots.reduce((sum, s) => sum + s.transactionCount, 0),
    };

    return {
      accountId,
      currency: account.currency,
      period: { start: startDate, end: endDate },
      movements,
      summary,
    };
  }

  /**
   * Creates a balance snapshot for an account
   */
  async createBalanceSnapshot(
    accountId: string,
    snapshotDate: Date = new Date(),
    snapshotType: SnapshotType = SnapshotType.DAILY
  ): Promise<string> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }

    // Get previous snapshot for opening balance
    const previousSnapshot = await this.snapshotRepository.findOne({
      where: {
        accountId,
        snapshotDate: LessThanOrEqual(new Date(snapshotDate.getTime() - 24 * 60 * 60 * 1000)),
      },
      order: { snapshotDate: 'DESC' },
    });

    const openingBalance = previousSnapshot?.closingBalance || 0;

    // Calculate day's transactions
    const startOfDay = new Date(snapshotDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(snapshotDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dayTransactions = await this.entryRepository
      .createQueryBuilder('entry')
      .innerJoin('entry.transaction', 'transaction')
      .where('entry.accountId = :accountId', { accountId })
      .andWhere('transaction.status = :status', { status: 'COMPLETED' })
      .andWhere('entry.createdAt BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      })
      .getMany();

    const totalDebits = dayTransactions
      .filter(entry => entry.entryType === EntryType.DEBIT)
      .reduce((sum, entry) => new Decimal(sum).plus(entry.amount).toNumber(), 0);

    const totalCredits = dayTransactions
      .filter(entry => entry.entryType === EntryType.CREDIT)
      .reduce((sum, entry) => new Decimal(sum).plus(entry.amount).toNumber(), 0);

    const closingBalance = this.calculateClosingBalance(
      account.accountType,
      openingBalance,
      totalDebits,
      totalCredits
    );

    // Create or update snapshot
    const existingSnapshot = await this.snapshotRepository.findOne({
      where: { accountId, snapshotDate, snapshotType },
    });

    if (existingSnapshot) {
      await this.snapshotRepository.update(existingSnapshot.id, {
        openingBalance,
        closingBalance,
        totalDebits,
        totalCredits,
        transactionCount: dayTransactions.length,
        updatedAt: new Date(),
      });
      return existingSnapshot.id;
    } else {
      const snapshot = this.snapshotRepository.create({
        accountId,
        snapshotDate,
        snapshotType,
        openingBalance,
        closingBalance,
        totalDebits,
        totalCredits,
        transactionCount: dayTransactions.length,
        currency: account.currency,
      });

      const saved = await this.snapshotRepository.save(snapshot);
      return saved.id;
    }
  }

  /**
   * Creates snapshots for all active accounts
   */
  async createSnapshotsForAllAccounts(
    snapshotDate: Date = new Date(),
    snapshotType: SnapshotType = SnapshotType.DAILY
  ): Promise<number> {
    const activeAccounts = await this.accountRepository.find({
      where: { isActive: true },
    });

    let snapshotCount = 0;
    for (const account of activeAccounts) {
      try {
        await this.createBalanceSnapshot(account.id, snapshotDate, snapshotType);
        snapshotCount++;
      } catch (error) {
        console.error(`Failed to create snapshot for account ${account.id}:`, error);
      }
    }

    return snapshotCount;
  }

  /**
   * Recalculates and updates account balance from transaction entries
   */
  async recalculateAccountBalance(accountId: string): Promise<void> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }

    const balanceData = await this.calculateRealTimeBalance(accountId);

    await this.accountRepository.update(accountId, {
      balance: balanceData.currentBalance,
      debitBalance: balanceData.totalDebits,
      creditBalance: balanceData.totalCredits,
      updatedAt: new Date(),
    });
  }

  /**
   * Gets account balance at a specific point in time
   */
  async getBalanceAtDate(accountId: string, date: Date): Promise<number> {
    // Try to get from snapshots first
    const snapshot = await this.snapshotRepository.findOne({
      where: {
        accountId,
        snapshotDate: LessThanOrEqual(date),
      },
      order: { snapshotDate: 'DESC' },
    });

    if (snapshot && this.isSameDay(snapshot.snapshotDate, date)) {
      return snapshot.closingBalance;
    }

    // Calculate from transaction entries
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }

    const entries = await this.entryRepository
      .createQueryBuilder('entry')
      .innerJoin('entry.transaction', 'transaction')
      .where('entry.accountId = :accountId', { accountId })
      .andWhere('transaction.status = :status', { status: 'COMPLETED' })
      .andWhere('entry.createdAt <= :date', { date })
      .orderBy('entry.createdAt', 'ASC')
      .getMany();

    const totalDebits = entries
      .filter(entry => entry.entryType === EntryType.DEBIT)
      .reduce((sum, entry) => new Decimal(sum).plus(entry.amount).toNumber(), 0);

    const totalCredits = entries
      .filter(entry => entry.entryType === EntryType.CREDIT)
      .reduce((sum, entry) => new Decimal(sum).plus(entry.amount).toNumber(), 0);

    return this.calculateClosingBalance(account.accountType, 0, totalDebits, totalCredits);
  }

  /**
   * Automated daily snapshot creation (runs at midnight)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async createDailySnapshots(): Promise<void> {
    // console.log('Starting daily balance snapshot creation...');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    try {
      const snapshotCount = await this.createSnapshotsForAllAccounts(yesterday, SnapshotType.DAILY);
      // console.log(`Created ${snapshotCount} daily balance snapshots for ${yesterday.toISOString().split('T')[0]}`);
    } catch (error) {
      console.error('Failed to create daily snapshots:', error);
    }
  }

  // Private helper methods
  private async calculateRealTimeBalance(accountId: string): Promise<{
    currentBalance: number;
    availableBalance: number;
    pendingBalance: number;
    totalDebits: number;
    totalCredits: number;
  }> {
    const entries = await this.entryRepository
      .createQueryBuilder('entry')
      .innerJoin('entry.transaction', 'transaction')
      .where('entry.accountId = :accountId', { accountId })
      .andWhere('transaction.status IN (:...statuses)', { 
        statuses: ['COMPLETED', 'PENDING', 'PROCESSING'] 
      })
      .getMany();

    const completedEntries = entries.filter(entry => 
      ['COMPLETED'].includes((entry as any).transaction?.status)
    );
    
    const pendingEntries = entries.filter(entry => 
      ['PENDING', 'PROCESSING'].includes((entry as any).transaction?.status)
    );

    const completedDebits = completedEntries
      .filter(entry => entry.entryType === EntryType.DEBIT)
      .reduce((sum, entry) => new Decimal(sum).plus(entry.amount).toNumber(), 0);

    const completedCredits = completedEntries
      .filter(entry => entry.entryType === EntryType.CREDIT)
      .reduce((sum, entry) => new Decimal(sum).plus(entry.amount).toNumber(), 0);

    const pendingDebits = pendingEntries
      .filter(entry => entry.entryType === EntryType.DEBIT)
      .reduce((sum, entry) => new Decimal(sum).plus(entry.amount).toNumber(), 0);

    const pendingCredits = pendingEntries
      .filter(entry => entry.entryType === EntryType.CREDIT)
      .reduce((sum, entry) => new Decimal(sum).plus(entry.amount).toNumber(), 0);

    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    const currentBalance = this.calculateClosingBalance(
      account.accountType,
      0,
      completedDebits,
      completedCredits
    );

    const pendingBalance = this.calculateClosingBalance(
      account.accountType,
      0,
      pendingDebits,
      pendingCredits
    );

    return {
      currentBalance,
      availableBalance: currentBalance, // For now, same as current. Can implement holds later
      pendingBalance,
      totalDebits: completedDebits,
      totalCredits: completedCredits,
    };
  }

  private calculateClosingBalance(
    accountType: AccountType,
    openingBalance: number,
    totalDebits: number,
    totalCredits: number
  ): number {
    const opening = new Decimal(openingBalance);
    const debits = new Decimal(totalDebits);
    const credits = new Decimal(totalCredits);

    // Asset and Expense accounts: Debits increase, Credits decrease
    if (accountType === AccountType.ASSET || accountType === AccountType.EXPENSE) {
      return opening.plus(debits).minus(credits).toNumber();
    }
    
    // Liability, Equity, and Revenue accounts: Credits increase, Debits decrease
    return opening.plus(credits).minus(debits).toNumber();
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }
}