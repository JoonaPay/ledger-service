import { Repository, DataSource } from 'typeorm';
import { LedgerAccountOrmEntity, TransactionOrmEntity, TransactionEntryOrmEntity } from '../../../infrastructure/orm-entities';
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
export declare class DoubleEntryService {
    private readonly accountRepository;
    private readonly transactionRepository;
    private readonly entryRepository;
    private readonly dataSource;
    constructor(accountRepository: Repository<LedgerAccountOrmEntity>, transactionRepository: Repository<TransactionOrmEntity>, entryRepository: Repository<TransactionEntryOrmEntity>, dataSource: DataSource);
    validateDoubleEntryTransaction(transaction: DoubleEntryTransaction): Promise<TransactionValidationResult>;
    processDoubleEntryTransaction(transaction: DoubleEntryTransaction): Promise<string>;
    createTransfer(fromAccountId: string, toAccountId: string, amount: number, description: string, reference?: string, metadata?: Record<string, any>): Promise<string>;
    createDeposit(accountId: string, amount: number, description: string, systemAccountId?: string, reference?: string, metadata?: Record<string, any>): Promise<string>;
    createWithdrawal(accountId: string, amount: number, description: string, systemAccountId?: string, reference?: string, metadata?: Record<string, any>): Promise<string>;
    private canDebitAccount;
    private calculateAccountBalance;
    private applyEntryToBalance;
    private updateAccountBalance;
    private getSystemCashAccount;
    private generateTransactionId;
    private generateTransactionReference;
}
