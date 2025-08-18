import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetricsService } from '@shared/metrics/metrics.service';
import { firstValueFrom } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { 
  LedgerAccountOrmEntity, 
  ReconciliationLogOrmEntity,
  ReconciliationType,
  BlnkSyncStatus
} from '../orm-entities';

export interface BlnkAccount {
  account_id: string;
  account_name: string;
  account_type: string;
  balance: number;
  currency: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface BlnkTransaction {
  transaction_id: string;
  reference: string;
  amount: number;
  currency: string;
  description: string;
  source_account_id: string;
  destination_account_id: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface CreateAccountRequest {
  account_name: string;
  account_type: string;
  currency: string;
  opening_balance?: number;
  metadata?: Record<string, any>;
}

export interface CreateTransactionRequest {
  reference: string;
  amount: number;
  currency: string;
  description: string;
  source_account_id: string;
  destination_account_id: string;
  metadata?: Record<string, any>;
}

export interface BlnkWebhookEvent {
  event_type: 'account.created' | 'account.updated' | 'transaction.completed' | 'transaction.failed' | 'balance.updated';
  event_id: string;
  timestamp: string;
  data: {
    account?: BlnkAccount;
    transaction?: BlnkTransaction;
    balance?: {
      account_id: string;
      balance: number;
      currency: string;
    };
  };
}

export interface SyncResult {
  accountId: string;
  internalBalance: number;
  externalBalance: number;
  variance: number;
  status: 'synced' | 'variance' | 'error';
  message?: string;
}

@Injectable()
export class BlnkFinanceService {
  private readonly logger = new Logger(BlnkFinanceService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly organization: string;
  private readonly timeout: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly metricsService: MetricsService,
    @InjectRepository(LedgerAccountOrmEntity)
    private readonly accountRepository: Repository<LedgerAccountOrmEntity>,
    @InjectRepository(ReconciliationLogOrmEntity)
    private readonly reconciliationRepository: Repository<ReconciliationLogOrmEntity>,
  ) {
    this.baseUrl = this.configService.get<string>('blnkfinance.url');
    this.apiKey = this.configService.get<string>('blnkfinance.apiKey');
    this.organization = this.configService.get<string>('blnkfinance.organization');
    this.timeout = this.configService.get<number>('blnkfinance.timeout', 30000);
  }

  async createAccount(accountData: CreateAccountRequest): Promise<BlnkAccount> {
    try {
      this.logger.log(`Creating account: ${accountData.account_name}`);
      
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/accounts`,
          {
            ...accountData,
            organization_id: this.organization,
          },
          {
            headers: this.getHeaders(),
            timeout: this.timeout,
          },
        ),
      );

      this.metricsService.recordLedgerOperation('create_account', 'success');
      this.metricsService.recordAccountOperation('create', accountData.account_type);
      this.metricsService.setBlnkFinanceHealth(true);
      
      this.logger.log(`Account created successfully: ${response.data.account_id}`);
      return response.data;
      
    } catch (error) {
      this.logger.error(`Failed to create account: ${error.message}`, error.stack);
      this.metricsService.recordLedgerOperation('create_account', 'failure');
      this.metricsService.recordError('blnkfinance_create_account', 'high');
      this.metricsService.setBlnkFinanceHealth(false);
      throw error;
    }
  }

  async getAccount(accountId: string): Promise<BlnkAccount> {
    try {
      this.logger.log(`Fetching account: ${accountId}`);
      
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/accounts/${accountId}`,
          {
            headers: this.getHeaders(),
            timeout: this.timeout,
          },
        ),
      );

      this.metricsService.recordLedgerOperation('get_account', 'success');
      this.metricsService.setBlnkFinanceHealth(true);
      
      return response.data;
      
    } catch (error) {
      this.logger.error(`Failed to get account ${accountId}: ${error.message}`, error.stack);
      this.metricsService.recordLedgerOperation('get_account', 'failure');
      this.metricsService.recordError('blnkfinance_get_account', 'medium');
      this.metricsService.setBlnkFinanceHealth(false);
      throw error;
    }
  }

  async updateAccountBalance(accountId: string, balance: number): Promise<BlnkAccount> {
    try {
      this.logger.log(`Updating account balance: ${accountId} to ${balance}`);
      
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.baseUrl}/accounts/${accountId}/balance`,
          { balance },
          {
            headers: this.getHeaders(),
            timeout: this.timeout,
          },
        ),
      );

      this.metricsService.recordLedgerOperation('update_balance', 'success');
      this.metricsService.recordAccountOperation('update_balance', 'unknown');
      this.metricsService.setBlnkFinanceHealth(true);
      
      const account = response.data;
      this.metricsService.updateAccountBalance(
        account.account_id,
        account.account_type,
        account.currency,
        account.balance,
      );
      
      return account;
      
    } catch (error) {
      this.logger.error(`Failed to update account balance ${accountId}: ${error.message}`, error.stack);
      this.metricsService.recordLedgerOperation('update_balance', 'failure');
      this.metricsService.recordError('blnkfinance_update_balance', 'high');
      this.metricsService.setBlnkFinanceHealth(false);
      throw error;
    }
  }

  async createTransaction(transactionData: CreateTransactionRequest): Promise<BlnkTransaction> {
    try {
      this.logger.log(`Creating transaction: ${transactionData.reference}`);
      
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/transactions`,
          {
            ...transactionData,
            organization_id: this.organization,
          },
          {
            headers: this.getHeaders(),
            timeout: this.timeout,
          },
        ),
      );

      this.metricsService.recordLedgerOperation('create_transaction', 'success');
      this.metricsService.recordTransaction('transfer', 'success');
      this.metricsService.setBlnkFinanceHealth(true);
      
      this.logger.log(`Transaction created successfully: ${response.data.transaction_id}`);
      return response.data;
      
    } catch (error) {
      this.logger.error(`Failed to create transaction: ${error.message}`, error.stack);
      this.metricsService.recordLedgerOperation('create_transaction', 'failure');
      this.metricsService.recordTransaction('transfer', 'failure');
      this.metricsService.recordError('blnkfinance_create_transaction', 'critical');
      this.metricsService.setBlnkFinanceHealth(false);
      throw error;
    }
  }

  async getTransaction(transactionId: string): Promise<BlnkTransaction> {
    try {
      this.logger.log(`Fetching transaction: ${transactionId}`);
      
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/transactions/${transactionId}`,
          {
            headers: this.getHeaders(),
            timeout: this.timeout,
          },
        ),
      );

      this.metricsService.recordLedgerOperation('get_transaction', 'success');
      this.metricsService.setBlnkFinanceHealth(true);
      
      return response.data;
      
    } catch (error) {
      this.logger.error(`Failed to get transaction ${transactionId}: ${error.message}`, error.stack);
      this.metricsService.recordLedgerOperation('get_transaction', 'failure');
      this.metricsService.recordError('blnkfinance_get_transaction', 'medium');
      this.metricsService.setBlnkFinanceHealth(false);
      throw error;
    }
  }

  async getAccountTransactions(accountId: string, limit = 50, offset = 0): Promise<BlnkTransaction[]> {
    try {
      this.logger.log(`Fetching transactions for account: ${accountId}`);
      
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/accounts/${accountId}/transactions`,
          {
            headers: this.getHeaders(),
            params: { limit, offset },
            timeout: this.timeout,
          },
        ),
      );

      this.metricsService.recordLedgerOperation('get_account_transactions', 'success');
      this.metricsService.setBlnkFinanceHealth(true);
      
      return response.data.transactions || [];
      
    } catch (error) {
      this.logger.error(`Failed to get account transactions ${accountId}: ${error.message}`, error.stack);
      this.metricsService.recordLedgerOperation('get_account_transactions', 'failure');
      this.metricsService.recordError('blnkfinance_get_account_transactions', 'medium');
      this.metricsService.setBlnkFinanceHealth(false);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/health`,
          {
            headers: this.getHeaders(),
            timeout: 5000,
          },
        ),
      );

      const isHealthy = response.status === 200;
      this.metricsService.setBlnkFinanceHealth(isHealthy);
      
      return isHealthy;
      
    } catch (error) {
      this.logger.error(`BlnkFinance health check failed: ${error.message}`);
      this.metricsService.setBlnkFinanceHealth(false);
      this.metricsService.recordError('blnkfinance_health_check', 'medium');
      return false;
    }
  }

  /**
   * Synchronizes account with BlnkFinance
   */
  async syncAccountWithBlnk(accountId: string): Promise<SyncResult> {
    try {
      const account = await this.accountRepository.findOne({
        where: { id: accountId },
      });

      if (!account) {
        throw new Error(`Account ${accountId} not found`);
      }

      if (!account.blnkAccountId) {
        // Create account in Blnk if it doesn't exist
        const blnkAccount = await this.createAccount({
          account_name: account.accountName,
          account_type: account.accountType,
          currency: account.currency,
          opening_balance: account.balance,
          metadata: {
            internal_account_id: account.id,
            user_id: account.userId,
          },
        });

        // Update local account with Blnk ID
        await this.accountRepository.update(accountId, {
          blnkAccountId: blnkAccount.account_id,
        });

        return {
          accountId,
          internalBalance: account.balance,
          externalBalance: blnkAccount.balance,
          variance: Math.abs(account.balance - blnkAccount.balance),
          status: 'synced',
        };
      } else {
        // Check existing account balance
        const blnkAccount = await this.getAccount(account.blnkAccountId);
        const variance = Math.abs(account.balance - blnkAccount.balance);
        const tolerance = 0.01; // 1 cent tolerance

        return {
          accountId,
          internalBalance: account.balance,
          externalBalance: blnkAccount.balance,
          variance,
          status: variance <= tolerance ? 'synced' : 'variance',
          message: variance > tolerance ? `Balance variance detected: ${variance}` : undefined,
        };
      }
    } catch (error) {
      this.logger.error(`Failed to sync account ${accountId}: ${error.message}`, error.stack);
      return {
        accountId,
        internalBalance: 0,
        externalBalance: 0,
        variance: 0,
        status: 'error',
        message: error.message,
      };
    }
  }

  /**
   * Synchronizes all accounts with BlnkFinance
   */
  async syncAllAccounts(): Promise<SyncResult[]> {
    const accounts = await this.accountRepository.find({
      where: { isActive: true },
    });

    const results: SyncResult[] = [];
    for (const account of accounts) {
      const result = await this.syncAccountWithBlnk(account.id);
      results.push(result);

      // Create reconciliation log if there's a variance
      if (result.status === 'variance') {
        await this.createReconciliationLog(account.id, result);
      }
    }

    return results;
  }

  /**
   * Posts transaction to BlnkFinance
   */
  async postTransactionToBlnk(
    sourceAccountId: string,
    destinationAccountId: string,
    amount: number,
    currency: string,
    reference: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<BlnkTransaction> {
    // Get Blnk account IDs
    const [sourceAccount, destAccount] = await Promise.all([
      this.accountRepository.findOne({ where: { id: sourceAccountId } }),
      this.accountRepository.findOne({ where: { id: destinationAccountId } }),
    ]);

    if (!sourceAccount?.blnkAccountId || !destAccount?.blnkAccountId) {
      throw new Error('One or both accounts are not synchronized with BlnkFinance');
    }

    return this.createTransaction({
      reference,
      amount,
      currency,
      description,
      source_account_id: sourceAccount.blnkAccountId,
      destination_account_id: destAccount.blnkAccountId,
      metadata: {
        ...metadata,
        internal_source_account_id: sourceAccountId,
        internal_destination_account_id: destinationAccountId,
      },
    });
  }

  /**
   * Handles webhook events from BlnkFinance
   */
  async handleWebhookEvent(event: BlnkWebhookEvent): Promise<void> {
    this.logger.log(`Received BlnkFinance webhook event: ${event.event_type}`);

    try {
      switch (event.event_type) {
        case 'account.created':
          await this.handleAccountCreated(event.data.account);
          break;
        case 'account.updated':
          await this.handleAccountUpdated(event.data.account);
          break;
        case 'transaction.completed':
          await this.handleTransactionCompleted(event.data.transaction);
          break;
        case 'transaction.failed':
          await this.handleTransactionFailed(event.data.transaction);
          break;
        case 'balance.updated':
          await this.handleBalanceUpdated(event.data.balance);
          break;
        default:
          this.logger.warn(`Unhandled webhook event type: ${event.event_type}`);
      }

      this.metricsService.recordLedgerOperation('webhook_processed', 'success');
    } catch (error) {
      this.logger.error(`Failed to process webhook event: ${error.message}`, error.stack);
      this.metricsService.recordLedgerOperation('webhook_processed', 'failure');
      throw error;
    }
  }

  /**
   * Reconciles account balance with BlnkFinance
   */
  async reconcileAccount(accountId: string): Promise<void> {
    const syncResult = await this.syncAccountWithBlnk(accountId);
    
    if (syncResult.status === 'variance') {
      await this.createReconciliationLog(accountId, syncResult);
      
      // Optional: Auto-correct small variances
      const tolerance = this.configService.get<number>('blnkfinance.autoCorrectTolerance', 0.05);
      if (syncResult.variance <= tolerance) {
        await this.autoCorrectVariance(accountId, syncResult);
      }
    }
  }

  /**
   * Automated reconciliation (runs every hour)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async performAutomatedReconciliation(): Promise<void> {
    this.logger.log('Starting automated BlnkFinance reconciliation...');
    
    try {
      const results = await this.syncAllAccounts();
      const varianceCount = results.filter(r => r.status === 'variance').length;
      const errorCount = results.filter(r => r.status === 'error').length;
      
      this.logger.log(`Reconciliation completed: ${results.length} accounts processed, ${varianceCount} variances, ${errorCount} errors`);
      
      if (varianceCount > 0 || errorCount > 0) {
        this.metricsService.recordError('blnkfinance_reconciliation_issues', 'medium');
      }
    } catch (error) {
      this.logger.error('Automated reconciliation failed:', error);
      this.metricsService.recordError('blnkfinance_reconciliation_failed', 'high');
    }
  }

  // Private helper methods
  private async handleAccountCreated(account: BlnkAccount): Promise<void> {
    // Find internal account by metadata
    const internalAccountId = account.metadata?.internal_account_id;
    if (internalAccountId) {
      await this.accountRepository.update(internalAccountId, {
        blnkAccountId: account.account_id,
      });
    }
  }

  private async handleAccountUpdated(account: BlnkAccount): Promise<void> {
    // Update internal account if needed
    const internalAccount = await this.accountRepository.findOne({
      where: { blnkAccountId: account.account_id },
    });

    if (internalAccount) {
      // Check for balance variance
      const variance = Math.abs(internalAccount.balance - account.balance);
      if (variance > 0.01) {
        await this.createReconciliationLog(internalAccount.id, {
          accountId: internalAccount.id,
          internalBalance: internalAccount.balance,
          externalBalance: account.balance,
          variance,
          status: 'variance',
          message: 'Balance updated in BlnkFinance',
        });
      }
    }
  }

  private async handleTransactionCompleted(transaction: BlnkTransaction): Promise<void> {
    // Update internal transaction status if it exists
    this.logger.log(`BlnkFinance transaction completed: ${transaction.transaction_id}`);
    // Implementation depends on how transactions are tracked internally
  }

  private async handleTransactionFailed(transaction: BlnkTransaction): Promise<void> {
    // Handle failed transaction
    this.logger.error(`BlnkFinance transaction failed: ${transaction.transaction_id}`);
    // Implementation depends on error handling strategy
  }

  private async handleBalanceUpdated(balanceData: any): Promise<void> {
    // Handle balance update
    const internalAccount = await this.accountRepository.findOne({
      where: { blnkAccountId: balanceData.account_id },
    });

    if (internalAccount) {
      const variance = Math.abs(internalAccount.balance - balanceData.balance);
      if (variance > 0.01) {
        await this.createReconciliationLog(internalAccount.id, {
          accountId: internalAccount.id,
          internalBalance: internalAccount.balance,
          externalBalance: balanceData.balance,
          variance,
          status: 'variance',
          message: 'Balance updated via webhook',
        });
      }
    }
  }

  private async createReconciliationLog(accountId: string, syncResult: SyncResult): Promise<void> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) return;

    const reconciliationLog = this.reconciliationRepository.create({
      accountId,
      reconciliationDate: new Date(),
      reconciliationType: ReconciliationType.EXTERNAL_BLNK,
      externalSource: 'BLNK_FINANCE',
      internalBalance: syncResult.internalBalance,
      externalBalance: syncResult.externalBalance,
      varianceAmount: syncResult.variance,
      currency: account.currency,
      blnkAccountId: account.blnkAccountId,
      blnkBalance: syncResult.externalBalance,
      blnkSyncStatus: syncResult.status === 'synced' ? BlnkSyncStatus.SYNCED : BlnkSyncStatus.OUT_OF_SYNC,
      varianceReason: syncResult.message,
      metadata: {
        syncTimestamp: new Date().toISOString(),
        autoGenerated: true,
      },
    });

    await this.reconciliationRepository.save(reconciliationLog);
  }

  private async autoCorrectVariance(accountId: string, syncResult: SyncResult): Promise<void> {
    this.logger.log(`Auto-correcting variance for account ${accountId}: ${syncResult.variance}`);
    
    try {
      // Update BlnkFinance balance to match internal balance
      await this.updateAccountBalance(
        (await this.accountRepository.findOne({ where: { id: accountId } }))?.blnkAccountId,
        syncResult.internalBalance
      );

      // Log the correction
      await this.reconciliationRepository.update(
        { accountId, reconciliationDate: new Date() },
        {
          resolutionAction: 'EXTERNAL_CORRECTION' as any,
          resolutionNotes: `Auto-corrected variance of ${syncResult.variance}`,
          reconciledAt: new Date(),
          reconciledBy: 'SYSTEM_AUTO_CORRECT',
        }
      );

      this.logger.log(`Variance auto-corrected for account ${accountId}`);
    } catch (error) {
      this.logger.error(`Failed to auto-correct variance for account ${accountId}:`, error);
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'X-Organization': this.organization,
    };
  }
}