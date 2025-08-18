import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { MetricsService } from '@shared/metrics/metrics.service';
import { LedgerAccountOrmEntity, ReconciliationLogOrmEntity } from '../orm-entities';
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
export declare class BlnkFinanceService {
    private readonly configService;
    private readonly httpService;
    private readonly metricsService;
    private readonly accountRepository;
    private readonly reconciliationRepository;
    private readonly logger;
    private readonly baseUrl;
    private readonly apiKey;
    private readonly organization;
    private readonly timeout;
    constructor(configService: ConfigService, httpService: HttpService, metricsService: MetricsService, accountRepository: Repository<LedgerAccountOrmEntity>, reconciliationRepository: Repository<ReconciliationLogOrmEntity>);
    createAccount(accountData: CreateAccountRequest): Promise<BlnkAccount>;
    getAccount(accountId: string): Promise<BlnkAccount>;
    updateAccountBalance(accountId: string, balance: number): Promise<BlnkAccount>;
    createTransaction(transactionData: CreateTransactionRequest): Promise<BlnkTransaction>;
    getTransaction(transactionId: string): Promise<BlnkTransaction>;
    getAccountTransactions(accountId: string, limit?: number, offset?: number): Promise<BlnkTransaction[]>;
    checkHealth(): Promise<boolean>;
    syncAccountWithBlnk(accountId: string): Promise<SyncResult>;
    syncAllAccounts(): Promise<SyncResult[]>;
    postTransactionToBlnk(sourceAccountId: string, destinationAccountId: string, amount: number, currency: string, reference: string, description: string, metadata?: Record<string, any>): Promise<BlnkTransaction>;
    handleWebhookEvent(event: BlnkWebhookEvent): Promise<void>;
    reconcileAccount(accountId: string): Promise<void>;
    performAutomatedReconciliation(): Promise<void>;
    private handleAccountCreated;
    private handleAccountUpdated;
    private handleTransactionCompleted;
    private handleTransactionFailed;
    private handleBalanceUpdated;
    private createReconciliationLog;
    private autoCorrectVariance;
    private getHeaders;
}
