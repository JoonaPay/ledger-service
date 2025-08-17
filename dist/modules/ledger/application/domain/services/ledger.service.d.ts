import { EventEmitter2 } from '@nestjs/event-emitter';
import { MetricsService } from '@shared/metrics/metrics.service';
import { BlnkFinanceService } from '../../../infrastructure/external/blnkfinance.service';
import { AccountRepository } from '../repositories/account.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { Account, AccountType } from '../entities/account.entity';
import { Transaction } from '../entities/transaction.entity';
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
export declare class LedgerService {
    private readonly accountRepository;
    private readonly transactionRepository;
    private readonly blnkFinanceService;
    private readonly eventEmitter;
    private readonly metricsService;
    private readonly logger;
    constructor(accountRepository: AccountRepository, transactionRepository: TransactionRepository, blnkFinanceService: BlnkFinanceService, eventEmitter: EventEmitter2, metricsService: MetricsService);
    createAccount(request: CreateAccountRequest): Promise<Account>;
    getAccount(accountId: string): Promise<Account>;
    getUserAccounts(ownerId: string): Promise<Account[]>;
    transfer(request: TransferRequest): Promise<Transaction>;
    deposit(request: DepositRequest): Promise<Transaction>;
    withdraw(request: WithdrawalRequest): Promise<Transaction>;
    getTransaction(transactionId: string): Promise<Transaction>;
    getAccountTransactions(accountId: string, page?: number, limit?: number): Promise<any>;
    private validateTransfer;
    private validateDeposit;
    private validateWithdrawal;
    private getOrCreateSystemAccount;
    private generateId;
    private generateReference;
}
