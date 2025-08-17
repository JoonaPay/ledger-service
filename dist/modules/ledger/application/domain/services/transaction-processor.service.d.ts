import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { LedgerAccountOrmEntity, TransactionOrmEntity, TransactionEntryOrmEntity, TransactionStatus, TransactionType, TransactionSource } from '../../../infrastructure/orm-entities';
import { DoubleEntryService } from './double-entry.service';
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
export declare class TransactionProcessorService {
    private readonly accountRepository;
    private readonly transactionRepository;
    private readonly entryRepository;
    private readonly doubleEntryService;
    private readonly balanceService;
    private readonly blnkFinanceService;
    private readonly eventEmitter;
    private readonly configService;
    private readonly dataSource;
    private readonly logger;
    constructor(accountRepository: Repository<LedgerAccountOrmEntity>, transactionRepository: Repository<TransactionOrmEntity>, entryRepository: Repository<TransactionEntryOrmEntity>, doubleEntryService: DoubleEntryService, balanceService: BalanceService, blnkFinanceService: BlnkFinanceService, eventEmitter: EventEmitter2, configService: ConfigService, dataSource: DataSource);
    processTransaction(request: ProcessTransactionRequest): Promise<TransactionResult>;
    reverseTransaction(originalTransactionId: string, reason: string, initiatedBy?: string): Promise<TransactionResult>;
    getTransactionStatus(transactionId: string): Promise<TransactionResult | null>;
    private validateTransaction;
    private processDeposit;
    private processWithdrawal;
    private processTransfer;
    private processFee;
    private processAdjustment;
    private createTransactionRecord;
    private executeDoubleEntryTransaction;
    private updateTransactionStatus;
    private syncWithBlnkFinance;
    private emitTransactionEvents;
    private getFeeCollectionAccount;
    private getAdjustmentAccount;
    private isBlnkSyncEnabled;
    private generateTransactionId;
    private generateTransactionReference;
    private generateReversalReference;
}
