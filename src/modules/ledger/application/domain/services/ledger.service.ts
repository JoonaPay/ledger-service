import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MetricsService } from '@shared/metrics/metrics.service';
import { BlnkFinanceService } from '../../../infrastructure/external/blnkfinance.service';
import { AccountRepository } from '../repositories/account.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { Account, AccountType, AccountStatus } from '../entities/account.entity';
import { Transaction, TransactionType, TransactionStatus, TransactionEntry } from '../entities/transaction.entity';

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  currency: string;
  ownerId?: string;
  parentAccountId?: string;
  initialBalance?: number;
  metadata?: Record<string, any>;
}

export interface TransferRequest {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currency: string;
  description: string;
  reference?: string;
  initiatedBy?: string;
  metadata?: Record<string, any>;
}

export interface DepositRequest {
  accountId: string;
  amount: number;
  currency: string;
  description: string;
  reference?: string;
  initiatedBy?: string;
  metadata?: Record<string, any>;
}

export interface WithdrawalRequest {
  accountId: string;
  amount: number;
  currency: string;
  description: string;
  reference?: string;
  initiatedBy?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly blnkFinanceService: BlnkFinanceService,
    private readonly eventEmitter: EventEmitter2,
    private readonly metricsService: MetricsService,
  ) {}

  async createAccount(request: CreateAccountRequest): Promise<Account> {
    try {
      this.logger.log(`Creating account: ${request.name} (${request.type})`);

      const accountId = this.generateId();
      const account = Account.create({
        id: accountId,
        name: request.name,
        type: request.type,
        currency: request.currency,
        balance: request.initialBalance || 0,
        availableBalance: request.initialBalance || 0,
        ownerId: request.ownerId,
        parentAccountId: request.parentAccountId,
        metadata: request.metadata,
      });

      const savedAccount = await this.accountRepository.create(account);

      await this.blnkFinanceService.createAccount({
        account_name: request.name,
        account_type: request.type,
        currency: request.currency,
        opening_balance: request.initialBalance || 0,
        metadata: {
          ...request.metadata,
          ledger_account_id: accountId,
          owner_id: request.ownerId,
        },
      });

      this.eventEmitter.emit('account.created', {
        accountId: savedAccount.id,
        ownerId: savedAccount.ownerId,
        type: savedAccount.type,
        currency: savedAccount.currency,
        balance: savedAccount.balance,
      });

      this.metricsService.recordAccountOperation('create', request.type);
      this.metricsService.updateAccountBalance(
        savedAccount.id,
        savedAccount.type,
        savedAccount.currency,
        savedAccount.balance,
      );

      this.logger.log(`Account created successfully: ${savedAccount.id}`);
      return savedAccount;

    } catch (error) {
      this.logger.error(`Failed to create account: ${error.message}`, error.stack);
      this.metricsService.recordError('create_account', 'high');
      throw error;
    }
  }

  async getAccount(accountId: string): Promise<Account> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new NotFoundException(`Account not found: ${accountId}`);
    }
    return account;
  }

  async getUserAccounts(ownerId: string): Promise<Account[]> {
    return this.accountRepository.findByOwnerId(ownerId);
  }

  async transfer(request: TransferRequest): Promise<Transaction> {
    try {
      this.logger.log(`Processing transfer: ${request.amount} ${request.currency} from ${request.sourceAccountId} to ${request.destinationAccountId}`);

      const [sourceAccount, destinationAccount] = await Promise.all([
        this.getAccount(request.sourceAccountId),
        this.getAccount(request.destinationAccountId),
      ]);

      this.validateTransfer(sourceAccount, destinationAccount, request.amount, request.currency);

      const transactionId = this.generateId();
      const reference = request.reference || this.generateReference();

      const entries = [
        new TransactionEntry(request.sourceAccountId, request.amount, 'debit', `Transfer to ${destinationAccount.name}`),
        new TransactionEntry(request.destinationAccountId, request.amount, 'credit', `Transfer from ${sourceAccount.name}`),
      ];

      const transaction = Transaction.create({
        id: transactionId,
        reference,
        type: TransactionType.TRANSFER,
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        entries,
        sourceAccountId: request.sourceAccountId,
        destinationAccountId: request.destinationAccountId,
        initiatedBy: request.initiatedBy,
        metadata: request.metadata,
      });

      const savedTransaction = await this.transactionRepository.create(transaction);

      await this.blnkFinanceService.createTransaction({
        reference,
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        source_account_id: request.sourceAccountId,
        destination_account_id: request.destinationAccountId,
        metadata: {
          ...request.metadata,
          ledger_transaction_id: transactionId,
          initiated_by: request.initiatedBy,
        },
      });

      const updatedSourceAccount = sourceAccount.updateBalance(
        sourceAccount.balance - request.amount,
        sourceAccount.availableBalance - request.amount,
      );
      const updatedDestinationAccount = destinationAccount.updateBalance(
        destinationAccount.balance + request.amount,
        destinationAccount.availableBalance + request.amount,
      );

      await Promise.all([
        this.accountRepository.update(updatedSourceAccount),
        this.accountRepository.update(updatedDestinationAccount),
      ]);

      const completedTransaction = savedTransaction.updateStatus(TransactionStatus.COMPLETED);
      await this.transactionRepository.update(completedTransaction);

      this.eventEmitter.emit('transaction.completed', {
        transactionId: completedTransaction.id,
        type: TransactionType.TRANSFER,
        amount: request.amount,
        currency: request.currency,
        sourceAccountId: request.sourceAccountId,
        destinationAccountId: request.destinationAccountId,
        initiatedBy: request.initiatedBy,
      });

      this.metricsService.recordTransaction('transfer', 'success');
      this.metricsService.updateAccountBalance(
        updatedSourceAccount.id,
        updatedSourceAccount.type,
        updatedSourceAccount.currency,
        updatedSourceAccount.balance,
      );
      this.metricsService.updateAccountBalance(
        updatedDestinationAccount.id,
        updatedDestinationAccount.type,
        updatedDestinationAccount.currency,
        updatedDestinationAccount.balance,
      );

      this.logger.log(`Transfer completed successfully: ${completedTransaction.id}`);
      return completedTransaction;

    } catch (error) {
      this.logger.error(`Transfer failed: ${error.message}`, error.stack);
      this.metricsService.recordTransaction('transfer', 'failure');
      this.metricsService.recordError('transfer', 'critical');
      throw error;
    }
  }

  async deposit(request: DepositRequest): Promise<Transaction> {
    try {
      this.logger.log(`Processing deposit: ${request.amount} ${request.currency} to ${request.accountId}`);

      const account = await this.getAccount(request.accountId);
      this.validateDeposit(account, request.amount, request.currency);

      const transactionId = this.generateId();
      const reference = request.reference || this.generateReference();

      const systemAccount = await this.getOrCreateSystemAccount(AccountType.SYSTEM_RESERVE, request.currency);

      const entries = [
        new TransactionEntry(systemAccount.id, request.amount, 'debit', `Deposit source`),
        new TransactionEntry(request.accountId, request.amount, 'credit', `Deposit to ${account.name}`),
      ];

      const transaction = Transaction.create({
        id: transactionId,
        reference,
        type: TransactionType.DEPOSIT,
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        entries,
        destinationAccountId: request.accountId,
        initiatedBy: request.initiatedBy,
        metadata: request.metadata,
      });

      const savedTransaction = await this.transactionRepository.create(transaction);

      const updatedAccount = account.updateBalance(
        account.balance + request.amount,
        account.availableBalance + request.amount,
      );
      await this.accountRepository.update(updatedAccount);

      const completedTransaction = savedTransaction.updateStatus(TransactionStatus.COMPLETED);
      await this.transactionRepository.update(completedTransaction);

      this.eventEmitter.emit('transaction.completed', {
        transactionId: completedTransaction.id,
        type: TransactionType.DEPOSIT,
        amount: request.amount,
        currency: request.currency,
        destinationAccountId: request.accountId,
        initiatedBy: request.initiatedBy,
      });

      this.metricsService.recordTransaction('deposit', 'success');
      this.metricsService.updateAccountBalance(
        updatedAccount.id,
        updatedAccount.type,
        updatedAccount.currency,
        updatedAccount.balance,
      );

      this.logger.log(`Deposit completed successfully: ${completedTransaction.id}`);
      return completedTransaction;

    } catch (error) {
      this.logger.error(`Deposit failed: ${error.message}`, error.stack);
      this.metricsService.recordTransaction('deposit', 'failure');
      this.metricsService.recordError('deposit', 'high');
      throw error;
    }
  }

  async withdraw(request: WithdrawalRequest): Promise<Transaction> {
    try {
      this.logger.log(`Processing withdrawal: ${request.amount} ${request.currency} from ${request.accountId}`);

      const account = await this.getAccount(request.accountId);
      this.validateWithdrawal(account, request.amount, request.currency);

      const transactionId = this.generateId();
      const reference = request.reference || this.generateReference();

      const systemAccount = await this.getOrCreateSystemAccount(AccountType.SYSTEM_RESERVE, request.currency);

      const entries = [
        new TransactionEntry(request.accountId, request.amount, 'debit', `Withdrawal from ${account.name}`),
        new TransactionEntry(systemAccount.id, request.amount, 'credit', `Withdrawal destination`),
      ];

      const transaction = Transaction.create({
        id: transactionId,
        reference,
        type: TransactionType.WITHDRAWAL,
        amount: request.amount,
        currency: request.currency,
        description: request.description,
        entries,
        sourceAccountId: request.accountId,
        initiatedBy: request.initiatedBy,
        metadata: request.metadata,
      });

      const savedTransaction = await this.transactionRepository.create(transaction);

      const updatedAccount = account.updateBalance(
        account.balance - request.amount,
        account.availableBalance - request.amount,
      );
      await this.accountRepository.update(updatedAccount);

      const completedTransaction = savedTransaction.updateStatus(TransactionStatus.COMPLETED);
      await this.transactionRepository.update(completedTransaction);

      this.eventEmitter.emit('transaction.completed', {
        transactionId: completedTransaction.id,
        type: TransactionType.WITHDRAWAL,
        amount: request.amount,
        currency: request.currency,
        sourceAccountId: request.accountId,
        initiatedBy: request.initiatedBy,
      });

      this.metricsService.recordTransaction('withdrawal', 'success');
      this.metricsService.updateAccountBalance(
        updatedAccount.id,
        updatedAccount.type,
        updatedAccount.currency,
        updatedAccount.balance,
      );

      this.logger.log(`Withdrawal completed successfully: ${completedTransaction.id}`);
      return completedTransaction;

    } catch (error) {
      this.logger.error(`Withdrawal failed: ${error.message}`, error.stack);
      this.metricsService.recordTransaction('withdrawal', 'failure');
      this.metricsService.recordError('withdrawal', 'high');
      throw error;
    }
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException(`Transaction not found: ${transactionId}`);
    }
    return transaction;
  }

  async getAccountTransactions(accountId: string, page = 1, limit = 50): Promise<any> {
    await this.getAccount(accountId);
    return this.transactionRepository.findByAccountId(accountId, page, limit);
  }

  private validateTransfer(sourceAccount: Account, destinationAccount: Account, amount: number, currency: string) {
    if (!sourceAccount.canDebit(amount)) {
      throw new BadRequestException('Insufficient funds or account not active');
    }
    if (!destinationAccount.canCredit()) {
      throw new BadRequestException('Destination account cannot receive credits');
    }
    if (sourceAccount.currency !== currency || destinationAccount.currency !== currency) {
      throw new BadRequestException('Currency mismatch');
    }
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
  }

  private validateDeposit(account: Account, amount: number, currency: string) {
    if (!account.canCredit()) {
      throw new BadRequestException('Account cannot receive credits');
    }
    if (account.currency !== currency) {
      throw new BadRequestException('Currency mismatch');
    }
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
  }

  private validateWithdrawal(account: Account, amount: number, currency: string) {
    if (!account.canDebit(amount)) {
      throw new BadRequestException('Insufficient funds or account not active');
    }
    if (account.currency !== currency) {
      throw new BadRequestException('Currency mismatch');
    }
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
  }

  private async getOrCreateSystemAccount(type: AccountType, currency: string): Promise<Account> {
    let systemAccount = await this.accountRepository.findSystemAccount(type, currency);
    
    if (!systemAccount) {
      const name = `${type.toUpperCase()} (${currency})`;
      systemAccount = await this.accountRepository.createSystemAccount(type, currency, name);
    }
    
    return systemAccount;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReference(): string {
    return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
}