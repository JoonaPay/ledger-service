import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Decimal } from 'decimal.js';
import { 
  LedgerAccountOrmEntity, 
  TransactionOrmEntity, 
  TransactionEntryOrmEntity,
  EntryType,
  TransactionStatus,
  AccountType,
  NormalBalance
} from '../../../infrastructure/orm-entities';

export interface DoubleEntryTransaction {
  transactionId: string;
  description: string;
  reference: string;
  entries: DoubleEntryLine[];
  metadata?: Record<string, any>;
}

export interface DoubleEntryLine {
  accountId: string;
  amount: number;
  type: 'debit' | 'credit';
  description?: string;
  sequence?: number;
}

export interface TransactionValidationResult {
  isValid: boolean;
  errors: string[];
  totalDebits: number;
  totalCredits: number;
  balanceDifference: number;
}

@Injectable()
export class DoubleEntryService {
  constructor(
    @InjectRepository(LedgerAccountOrmEntity)
    private readonly accountRepository: Repository<LedgerAccountOrmEntity>,
    @InjectRepository(TransactionOrmEntity)
    private readonly transactionRepository: Repository<TransactionOrmEntity>,
    @InjectRepository(TransactionEntryOrmEntity)
    private readonly entryRepository: Repository<TransactionEntryOrmEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Validates a double-entry transaction according to accounting principles
   */
  async validateDoubleEntryTransaction(transaction: DoubleEntryTransaction): Promise<TransactionValidationResult> {
    const errors: string[] = [];
    
    // Calculate totals
    const totalDebits = transaction.entries
      .filter(entry => entry.type === 'debit')
      .reduce((sum, entry) => new Decimal(sum).plus(entry.amount).toNumber(), 0);
    
    const totalCredits = transaction.entries
      .filter(entry => entry.type === 'credit')
      .reduce((sum, entry) => new Decimal(sum).plus(entry.amount).toNumber(), 0);
    
    const balanceDifference = new Decimal(totalDebits).minus(totalCredits).toNumber();

    // Validation rules
    if (transaction.entries.length < 2) {
      errors.push('Transaction must have at least 2 entries for double-entry bookkeeping');
    }

    if (Math.abs(balanceDifference) > 0.01) { // Allow 1 cent tolerance for rounding
      errors.push(`Transaction is unbalanced: debits=${totalDebits}, credits=${totalCredits}, difference=${balanceDifference}`);
    }

    // Validate all amounts are positive
    for (const entry of transaction.entries) {
      if (entry.amount <= 0) {
        errors.push(`Entry for account ${entry.accountId} has invalid amount: ${entry.amount}`);
      }
    }

    // Validate accounts exist and are active
    const accountIds = transaction.entries.map(entry => entry.accountId);
    const accounts = await this.accountRepository.findBy({ id: { $in: accountIds } as any });
    
    for (const accountId of accountIds) {
      const account = accounts.find(acc => acc.id === accountId);
      if (!account) {
        errors.push(`Account ${accountId} not found`);
      } else if (!account.isActive) {
        errors.push(`Account ${accountId} is not active`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      totalDebits,
      totalCredits,
      balanceDifference,
    };
  }

  /**
   * Processes a double-entry transaction with full atomicity
   */
  async processDoubleEntryTransaction(transaction: DoubleEntryTransaction): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate the transaction
      const validation = await this.validateDoubleEntryTransaction(transaction);
      if (!validation.isValid) {
        throw new Error(`Transaction validation failed: ${validation.errors.join(', ')}`);
      }

      // Get accounts with locking to prevent concurrent modifications
      const accountIds = transaction.entries.map(entry => entry.accountId);
      const accounts = await queryRunner.manager
        .createQueryBuilder(LedgerAccountOrmEntity, 'account')
        .setLock('pessimistic_write')
        .whereInIds(accountIds)
        .getMany();

      // Validate accounts again within transaction
      for (const entry of transaction.entries) {
        const account = accounts.find(acc => acc.id === entry.accountId);
        if (!account) {
          throw new Error(`Account ${entry.accountId} not found`);
        }

        // Check if account can handle the operation
        if (entry.type === 'debit' && !this.canDebitAccount(account, entry.amount)) {
          throw new Error(`Insufficient funds in account ${entry.accountId}`);
        }
      }

      // Create transaction record
      const transactionEntity = queryRunner.manager.create(TransactionOrmEntity, {
        id: transaction.transactionId,
        transactionReference: transaction.reference,
        transactionType: 'TRANSFER', // Default type
        amount: validation.totalDebits, // Use total amount
        currency: accounts[0]?.currency || 'USD',
        description: transaction.description,
        accountId: transaction.entries[0]?.accountId,
        status: TransactionStatus.PROCESSING,
        balanceBefore: 0, // Will be updated
        balanceAfter: 0, // Will be updated
        metadata: transaction.metadata,
      });

      await queryRunner.manager.save(transactionEntity);

      // Process each entry
      const entries: TransactionEntryOrmEntity[] = [];
      for (let i = 0; i < transaction.entries.length; i++) {
        const entry = transaction.entries[i];
        const account = accounts.find(acc => acc.id === entry.accountId);
        
        // Calculate balance before and after
        const balanceBefore = this.calculateAccountBalance(account);
        const balanceAfter = this.applyEntryToBalance(account, entry);

        // Create transaction entry
        const entryEntity = queryRunner.manager.create(TransactionEntryOrmEntity, {
          transactionId: transaction.transactionId,
          accountId: entry.accountId,
          entryType: entry.type.toUpperCase() as EntryType,
          amount: entry.amount,
          currency: account.currency,
          description: entry.description || transaction.description,
          balanceBefore,
          balanceAfter,
          entrySequence: entry.sequence || i + 1,
          metadata: { 
            originalTransactionId: transaction.transactionId,
            entryIndex: i 
          },
        });

        await queryRunner.manager.save(entryEntity);
        entries.push(entryEntity);

        // Update account balance
        await this.updateAccountBalance(queryRunner, account, entry);
      }

      // Update transaction status to completed
      await queryRunner.manager.update(TransactionOrmEntity, transaction.transactionId, {
        status: TransactionStatus.COMPLETED,
        processedAt: new Date(),
      });

      await queryRunner.commitTransaction();
      return transaction.transactionId;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      // Update transaction status to failed
      try {
        await this.transactionRepository.update(transaction.transactionId, {
          status: TransactionStatus.FAILED,
          failedReason: error.message,
        });
      } catch (updateError) {
        // Log the error but don't throw to preserve original error
        console.error('Failed to update transaction status:', updateError);
      }
      
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Creates a simple transfer between two accounts
   */
  async createTransfer(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string,
    reference?: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    const transactionId = this.generateTransactionId();
    const transactionReference = reference || this.generateTransactionReference();

    const doubleEntryTransaction: DoubleEntryTransaction = {
      transactionId,
      reference: transactionReference,
      description,
      entries: [
        {
          accountId: fromAccountId,
          amount,
          type: 'credit',
          description: `Transfer to ${toAccountId}`,
          sequence: 1,
        },
        {
          accountId: toAccountId,
          amount,
          type: 'debit',
          description: `Transfer from ${fromAccountId}`,
          sequence: 2,
        },
      ],
      metadata,
    };

    return this.processDoubleEntryTransaction(doubleEntryTransaction);
  }

  /**
   * Creates a deposit transaction
   */
  async createDeposit(
    accountId: string,
    amount: number,
    description: string,
    systemAccountId?: string,
    reference?: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    const transactionId = this.generateTransactionId();
    const transactionReference = reference || this.generateTransactionReference();
    const defaultSystemAccount = systemAccountId || await this.getSystemCashAccount();

    const doubleEntryTransaction: DoubleEntryTransaction = {
      transactionId,
      reference: transactionReference,
      description,
      entries: [
        {
          accountId: accountId,
          amount,
          type: 'debit',
          description: `Deposit: ${description}`,
          sequence: 1,
        },
        {
          accountId: defaultSystemAccount,
          amount,
          type: 'credit',
          description: `Deposit source: ${description}`,
          sequence: 2,
        },
      ],
      metadata,
    };

    return this.processDoubleEntryTransaction(doubleEntryTransaction);
  }

  /**
   * Creates a withdrawal transaction
   */
  async createWithdrawal(
    accountId: string,
    amount: number,
    description: string,
    systemAccountId?: string,
    reference?: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    const transactionId = this.generateTransactionId();
    const transactionReference = reference || this.generateTransactionReference();
    const defaultSystemAccount = systemAccountId || await this.getSystemCashAccount();

    const doubleEntryTransaction: DoubleEntryTransaction = {
      transactionId,
      reference: transactionReference,
      description,
      entries: [
        {
          accountId: accountId,
          amount,
          type: 'credit',
          description: `Withdrawal: ${description}`,
          sequence: 1,
        },
        {
          accountId: defaultSystemAccount,
          amount,
          type: 'debit',
          description: `Withdrawal destination: ${description}`,
          sequence: 2,
        },
      ],
      metadata,
    };

    return this.processDoubleEntryTransaction(doubleEntryTransaction);
  }

  // Helper methods
  private canDebitAccount(account: LedgerAccountOrmEntity, amount: number): boolean {
    // For now, allow all debits. In production, implement balance checks
    return true;
  }

  private calculateAccountBalance(account: LedgerAccountOrmEntity): number {
    return account.balance;
  }

  private applyEntryToBalance(account: LedgerAccountOrmEntity, entry: DoubleEntryLine): number {
    const currentBalance = new Decimal(account.balance);
    const entryAmount = new Decimal(entry.amount);

    if (entry.type === 'debit') {
      // For asset accounts, debits increase balance
      // For liability/equity/revenue accounts, debits decrease balance
      if (account.accountType === AccountType.ASSET || account.accountType === AccountType.EXPENSE) {
        return currentBalance.plus(entryAmount).toNumber();
      } else {
        return currentBalance.minus(entryAmount).toNumber();
      }
    } else {
      // Credits
      if (account.accountType === AccountType.ASSET || account.accountType === AccountType.EXPENSE) {
        return currentBalance.minus(entryAmount).toNumber();
      } else {
        return currentBalance.plus(entryAmount).toNumber();
      }
    }
  }

  private async updateAccountBalance(
    queryRunner: QueryRunner,
    account: LedgerAccountOrmEntity,
    entry: DoubleEntryLine
  ): Promise<void> {
    const newBalance = this.applyEntryToBalance(account, entry);
    const entryAmount = new Decimal(entry.amount);

    const updates: Partial<LedgerAccountOrmEntity> = {
      balance: newBalance,
      updatedAt: new Date(),
    };

    // Update debit/credit balances
    if (entry.type === 'debit') {
      updates.debitBalance = new Decimal(account.debitBalance).plus(entryAmount).toNumber();
    } else {
      updates.creditBalance = new Decimal(account.creditBalance).plus(entryAmount).toNumber();
    }

    await queryRunner.manager.update(LedgerAccountOrmEntity, account.id, updates);
    
    // Update the in-memory object for subsequent calculations
    Object.assign(account, updates);
  }

  private async getSystemCashAccount(): Promise<string> {
    const systemAccount = await this.accountRepository.findOne({
      where: { 
        accountName: 'SYSTEM_CASH',
        accountType: AccountType.ASSET,
        isActive: true 
      },
    });

    if (!systemAccount) {
      throw new Error('System cash account not found');
    }

    return systemAccount.id;
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTransactionReference(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `TXN${date}${random}`;
  }
}