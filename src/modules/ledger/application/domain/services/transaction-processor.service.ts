import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { 
  LedgerAccountOrmEntity, 
  TransactionOrmEntity, 
  TransactionEntryOrmEntity,
  TransactionStatus,
  TransactionType,
  TransactionSource
} from '../../../infrastructure/orm-entities';
import { DoubleEntryService, DoubleEntryTransaction } from './double-entry.service';
import { BalanceService } from './balance.service';
import { BlnkFinanceService } from '../../../infrastructure/external/blnkfinance.service';

export interface ProcessTransactionRequest {
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  sourceAccountId?: string;
  destinationAccountId?: string;
  reference?: string;
  externalReference?: string;
  source?: TransactionSource;
  metadata?: Record<string, any>;
  initiatedBy?: string;
}

export interface TransactionResult {
  transactionId: string;
  reference: string;
  status: TransactionStatus;
  amount: number;
  currency: string;
  sourceAccountId?: string;
  destinationAccountId?: string;
  entries: Array<{
    accountId: string;
    amount: number;
    type: 'debit' | 'credit';
    balanceBefore: number;
    balanceAfter: number;
  }>;
  metadata?: Record<string, any>;
  processedAt?: Date;
  failedReason?: string;
}

export interface TransactionValidation {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

@Injectable()
export class TransactionProcessorService {
  private readonly logger = new Logger(TransactionProcessorService.name);

  constructor(
    @InjectRepository(LedgerAccountOrmEntity)
    private readonly accountRepository: Repository<LedgerAccountOrmEntity>,
    @InjectRepository(TransactionOrmEntity)
    private readonly transactionRepository: Repository<TransactionOrmEntity>,
    @InjectRepository(TransactionEntryOrmEntity)
    private readonly entryRepository: Repository<TransactionEntryOrmEntity>,
    private readonly doubleEntryService: DoubleEntryService,
    private readonly balanceService: BalanceService,
    private readonly blnkFinanceService: BlnkFinanceService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Processes a financial transaction with full validation and double-entry bookkeeping
   */
  async processTransaction(request: ProcessTransactionRequest): Promise<TransactionResult> {
    const transactionId = this.generateTransactionId();
    const reference = request.reference || this.generateTransactionReference();

    this.logger.log(`Processing transaction ${transactionId}: ${request.type} - ${request.amount} ${request.currency}`);

    try {
      // Validate the transaction
      const validation = await this.validateTransaction(request);
      if (!validation.isValid) {
        throw new Error(`Transaction validation failed: ${validation.errors.join(', ')}`);
      }

      // Create initial transaction record
      const transaction = await this.createTransactionRecord(transactionId, reference, request);

      // Process based on transaction type
      let result: TransactionResult;
      switch (request.type) {
        case TransactionType.DEPOSIT:
          result = await this.processDeposit(transaction, request);
          break;
        case TransactionType.WITHDRAWAL:
          result = await this.processWithdrawal(transaction, request);
          break;
        case TransactionType.TRANSFER:
          result = await this.processTransfer(transaction, request);
          break;
        case TransactionType.FEE:
          result = await this.processFee(transaction, request);
          break;
        case TransactionType.ADJUSTMENT:
          result = await this.processAdjustment(transaction, request);
          break;
        default:
          throw new Error(`Unsupported transaction type: ${request.type}`);
      }

      // Sync with BlnkFinance if enabled
      if (this.isBlnkSyncEnabled() && result.status === TransactionStatus.COMPLETED) {
        await this.syncWithBlnkFinance(result, request);
      }

      // Emit transaction events
      await this.emitTransactionEvents(result);

      this.logger.log(`Transaction ${transactionId} processed successfully with status: ${result.status}`);
      return result;

    } catch (error) {
      this.logger.error(`Transaction ${transactionId} failed: ${error.message}`, error.stack);
      
      // Update transaction status to failed
      await this.updateTransactionStatus(transactionId, TransactionStatus.FAILED, error.message);

      // Emit failure event
      this.eventEmitter.emit('transaction.failed', {
        transactionId,
        reference,
        error: error.message,
        request,
      });

      throw error;
    }
  }

  /**
   * Reverses a completed transaction
   */
  async reverseTransaction(
    originalTransactionId: string,
    reason: string,
    initiatedBy?: string
  ): Promise<TransactionResult> {
    const originalTransaction = await this.transactionRepository.findOne({
      where: { id: originalTransactionId },
      relations: ['entries'],
    });

    if (!originalTransaction) {
      throw new Error(`Original transaction ${originalTransactionId} not found`);
    }

    if (originalTransaction.status !== TransactionStatus.COMPLETED) {
      throw new Error(`Cannot reverse transaction with status: ${originalTransaction.status}`);
    }

    if (originalTransaction.isReversal) {
      throw new Error('Cannot reverse a reversal transaction');
    }

    const reversalId = this.generateTransactionId();
    const reversalReference = this.generateReversalReference(originalTransaction.transactionReference);

    this.logger.log(`Reversing transaction ${originalTransactionId} with reversal ${reversalId}`);

    try {
      // Create reversal entries (opposite of original)
      const reversalEntries = originalTransaction.entries.map(entry => ({
        accountId: entry.accountId,
        amount: entry.amount,
        type: entry.entryType === 'DEBIT' ? 'credit' as const : 'debit' as const,
        description: `Reversal: ${entry.description || reason}`,
      }));

      // Create double-entry transaction for reversal
      const doubleEntryTxn: DoubleEntryTransaction = {
        transactionId: reversalId,
        reference: reversalReference,
        description: `Reversal of ${originalTransaction.transactionReference}: ${reason}`,
        entries: reversalEntries,
        metadata: {
          isReversal: true,
          originalTransactionId: originalTransactionId,
          originalReference: originalTransaction.transactionReference,
          reversalReason: reason,
          initiatedBy,
        },
      };

      // Process the reversal
      await this.doubleEntryService.processDoubleEntryTransaction(doubleEntryTxn);

      // Update original transaction
      await this.transactionRepository.update(originalTransactionId, {
        status: TransactionStatus.REVERSED,
        reversalTransactionId: reversalId,
        metadata: {
          ...originalTransaction.metadata,
          reversedAt: new Date().toISOString(),
          reversalReason: reason,
          reversedBy: initiatedBy,
        },
      });

      // Get the reversal transaction details
      const reversalTransaction = await this.transactionRepository.findOne({
        where: { id: reversalId },
        relations: ['entries'],
      });

      const result: TransactionResult = {
        transactionId: reversalId,
        reference: reversalReference,
        status: TransactionStatus.COMPLETED,
        amount: originalTransaction.amount,
        currency: originalTransaction.currency,
        sourceAccountId: originalTransaction.counterpartyAccountId, // Reversed
        destinationAccountId: originalTransaction.accountId, // Reversed
        entries: reversalTransaction.entries.map(entry => ({
          accountId: entry.accountId,
          amount: entry.amount,
          type: entry.entryType.toLowerCase() as 'debit' | 'credit',
          balanceBefore: entry.balanceBefore,
          balanceAfter: entry.balanceAfter,
        })),
        metadata: doubleEntryTxn.metadata,
        processedAt: new Date(),
      };

      // Emit reversal events
      this.eventEmitter.emit('transaction.reversed', {
        originalTransactionId,
        reversalTransactionId: reversalId,
        reason,
        initiatedBy,
      });

      this.logger.log(`Transaction ${originalTransactionId} reversed successfully`);
      return result;

    } catch (error) {
      this.logger.error(`Failed to reverse transaction ${originalTransactionId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Gets transaction status and details
   */
  async getTransactionStatus(transactionId: string): Promise<TransactionResult | null> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['entries', 'account', 'counterpartyAccount'],
    });

    if (!transaction) {
      return null;
    }

    return {
      transactionId: transaction.id,
      reference: transaction.transactionReference,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      sourceAccountId: transaction.accountId,
      destinationAccountId: transaction.counterpartyAccountId,
      entries: transaction.entries.map(entry => ({
        accountId: entry.accountId,
        amount: entry.amount,
        type: entry.entryType.toLowerCase() as 'debit' | 'credit',
        balanceBefore: entry.balanceBefore,
        balanceAfter: entry.balanceAfter,
      })),
      metadata: transaction.metadata,
      processedAt: transaction.processedAt,
      failedReason: transaction.failedReason,
    };
  }

  /**
   * Validates a transaction request
   */
  private async validateTransaction(request: ProcessTransactionRequest): Promise<TransactionValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!request.amount || request.amount <= 0) {
      errors.push('Amount must be positive');
    }

    if (!request.currency || request.currency.length !== 3) {
      errors.push('Invalid currency code');
    }

    if (!request.description || request.description.trim().length === 0) {
      errors.push('Description is required');
    }

    // Type-specific validation
    switch (request.type) {
      case TransactionType.TRANSFER:
        if (!request.sourceAccountId || !request.destinationAccountId) {
          errors.push('Transfer requires both source and destination accounts');
        }
        if (request.sourceAccountId === request.destinationAccountId) {
          errors.push('Source and destination accounts cannot be the same');
        }
        break;

      case TransactionType.DEPOSIT:
        if (!request.destinationAccountId) {
          errors.push('Deposit requires a destination account');
        }
        break;

      case TransactionType.WITHDRAWAL:
        if (!request.sourceAccountId) {
          errors.push('Withdrawal requires a source account');
        }
        break;
    }

    // Account validation
    const accountIds = [request.sourceAccountId, request.destinationAccountId].filter(Boolean);
    if (accountIds.length > 0) {
      const accounts = await this.accountRepository.findBy({ id: { $in: accountIds } as any });
      
      for (const accountId of accountIds) {
        const account = accounts.find(acc => acc.id === accountId);
        if (!account) {
          errors.push(`Account ${accountId} not found`);
        } else if (!account.isActive) {
          errors.push(`Account ${accountId} is not active`);
        } else if (account.currency !== request.currency) {
          warnings.push(`Account ${accountId} currency (${account.currency}) differs from transaction currency (${request.currency})`);
        }
      }
    }

    // Amount limits validation
    const maxTransactionAmount = this.configService.get<number>('ledger.maxTransactionAmount', 1000000);
    if (request.amount > maxTransactionAmount) {
      errors.push(`Transaction amount exceeds maximum limit of ${maxTransactionAmount}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Transaction type processors
  private async processDeposit(
    transaction: TransactionOrmEntity,
    request: ProcessTransactionRequest
  ): Promise<TransactionResult> {
    return this.executeDoubleEntryTransaction(
      transaction.id,
      transaction.transactionReference,
      await this.doubleEntryService.createDeposit(
        request.destinationAccountId!,
        request.amount,
        request.description,
        undefined, // Let service find system account
        transaction.transactionReference,
        request.metadata
      )
    );
  }

  private async processWithdrawal(
    transaction: TransactionOrmEntity,
    request: ProcessTransactionRequest
  ): Promise<TransactionResult> {
    return this.executeDoubleEntryTransaction(
      transaction.id,
      transaction.transactionReference,
      await this.doubleEntryService.createWithdrawal(
        request.sourceAccountId!,
        request.amount,
        request.description,
        undefined, // Let service find system account
        transaction.transactionReference,
        request.metadata
      )
    );
  }

  private async processTransfer(
    transaction: TransactionOrmEntity,
    request: ProcessTransactionRequest
  ): Promise<TransactionResult> {
    return this.executeDoubleEntryTransaction(
      transaction.id,
      transaction.transactionReference,
      await this.doubleEntryService.createTransfer(
        request.sourceAccountId!,
        request.destinationAccountId!,
        request.amount,
        request.description,
        transaction.transactionReference,
        request.metadata
      )
    );
  }

  private async processFee(
    transaction: TransactionOrmEntity,
    request: ProcessTransactionRequest
  ): Promise<TransactionResult> {
    // Fee collection: debit from source account, credit to fee collection account
    const feeCollectionAccount = await this.getFeeCollectionAccount(request.currency);
    
    return this.executeDoubleEntryTransaction(
      transaction.id,
      transaction.transactionReference,
      await this.doubleEntryService.createTransfer(
        request.sourceAccountId!,
        feeCollectionAccount,
        request.amount,
        `Fee: ${request.description}`,
        transaction.transactionReference,
        request.metadata
      )
    );
  }

  private async processAdjustment(
    transaction: TransactionOrmEntity,
    request: ProcessTransactionRequest
  ): Promise<TransactionResult> {
    // Adjustment: balance correction
    const adjustmentAccount = await this.getAdjustmentAccount(request.currency);
    
    return this.executeDoubleEntryTransaction(
      transaction.id,
      transaction.transactionReference,
      await this.doubleEntryService.createTransfer(
        adjustmentAccount,
        request.destinationAccountId || request.sourceAccountId!,
        request.amount,
        `Adjustment: ${request.description}`,
        transaction.transactionReference,
        request.metadata
      )
    );
  }

  // Helper methods
  private async createTransactionRecord(
    transactionId: string,
    reference: string,
    request: ProcessTransactionRequest
  ): Promise<TransactionOrmEntity> {
    const transaction = this.transactionRepository.create({
      id: transactionId,
      transactionReference: reference,
      transactionType: request.type,
      amount: request.amount,
      currency: request.currency,
      description: request.description,
      accountId: request.sourceAccountId || request.destinationAccountId!,
      counterpartyAccountId: request.destinationAccountId || request.sourceAccountId,
      externalReference: request.externalReference,
      source: request.source || TransactionSource.INTERNAL,
      status: TransactionStatus.PENDING,
      balanceBefore: 0, // Will be updated during processing
      balanceAfter: 0, // Will be updated during processing
      metadata: {
        ...request.metadata,
        initiatedBy: request.initiatedBy,
        processedBy: 'LEDGER_SERVICE',
      },
    });

    return this.transactionRepository.save(transaction);
  }

  private async executeDoubleEntryTransaction(
    transactionId: string,
    reference: string,
    doubleEntryTxnId: string
  ): Promise<TransactionResult> {
    // Get the completed transaction details
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['entries'],
    });

    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found after processing`);
    }

    return {
      transactionId,
      reference,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      sourceAccountId: transaction.accountId,
      destinationAccountId: transaction.counterpartyAccountId,
      entries: transaction.entries.map(entry => ({
        accountId: entry.accountId,
        amount: entry.amount,
        type: entry.entryType.toLowerCase() as 'debit' | 'credit',
        balanceBefore: entry.balanceBefore,
        balanceAfter: entry.balanceAfter,
      })),
      metadata: transaction.metadata,
      processedAt: transaction.processedAt,
    };
  }

  private async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
    failedReason?: string
  ): Promise<void> {
    const updates: Partial<TransactionOrmEntity> = {
      status,
      updatedAt: new Date(),
    };

    if (status === TransactionStatus.COMPLETED) {
      updates.processedAt = new Date();
    } else if (status === TransactionStatus.FAILED && failedReason) {
      updates.failedReason = failedReason;
    }

    await this.transactionRepository.update(transactionId, updates);
  }

  private async syncWithBlnkFinance(
    result: TransactionResult,
    request: ProcessTransactionRequest
  ): Promise<void> {
    try {
      if (request.type === TransactionType.TRANSFER && result.sourceAccountId && result.destinationAccountId) {
        await this.blnkFinanceService.postTransactionToBlnk(
          result.sourceAccountId,
          result.destinationAccountId,
          result.amount,
          result.currency,
          result.reference,
          request.description,
          result.metadata
        );
      }
    } catch (error) {
      this.logger.error(`Failed to sync transaction ${result.transactionId} with BlnkFinance: ${error.message}`);
      // Don't fail the transaction, just log the sync error
    }
  }

  private async emitTransactionEvents(result: TransactionResult): Promise<void> {
    this.eventEmitter.emit('transaction.processed', result);
    
    if (result.status === TransactionStatus.COMPLETED) {
      this.eventEmitter.emit('transaction.completed', result);
    } else if (result.status === TransactionStatus.FAILED) {
      this.eventEmitter.emit('transaction.failed', result);
    }
  }

  private async getFeeCollectionAccount(currency: string): Promise<string> {
    const account = await this.accountRepository.findOne({
      where: {
        accountName: `FEE_COLLECTION_${currency}`,
        currency,
        isActive: true,
      },
    });

    if (!account) {
      throw new Error(`Fee collection account not found for currency: ${currency}`);
    }

    return account.id;
  }

  private async getAdjustmentAccount(currency: string): Promise<string> {
    const account = await this.accountRepository.findOne({
      where: {
        accountName: `ADJUSTMENT_${currency}`,
        currency,
        isActive: true,
      },
    });

    if (!account) {
      throw new Error(`Adjustment account not found for currency: ${currency}`);
    }

    return account.id;
  }

  private isBlnkSyncEnabled(): boolean {
    return this.configService.get<boolean>('blnkfinance.syncEnabled', true);
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTransactionReference(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `TXN${date}${random}`;
  }

  private generateReversalReference(originalReference: string): string {
    return `REV_${originalReference}_${Date.now()}`;
  }
}