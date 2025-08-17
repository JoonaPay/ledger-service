import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';
export interface TransactionFilters {
    accountId?: string;
    type?: TransactionType;
    status?: TransactionStatus;
    currency?: string;
    fromDate?: Date;
    toDate?: Date;
    initiatedBy?: string;
    externalReference?: string;
    minAmount?: number;
    maxAmount?: number;
}
export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface TransactionRepository {
    create(transaction: Transaction): Promise<Transaction>;
    findById(id: string): Promise<Transaction | null>;
    findByReference(reference: string): Promise<Transaction | null>;
    findByExternalReference(externalReference: string): Promise<Transaction[]>;
    update(transaction: Transaction): Promise<Transaction>;
    delete(id: string): Promise<void>;
    findWithFilters(filters: TransactionFilters, page?: number, limit?: number, sortBy?: string, sortOrder?: 'ASC' | 'DESC'): Promise<PaginatedResult<Transaction>>;
    findByAccountId(accountId: string, page?: number, limit?: number, fromDate?: Date, toDate?: Date): Promise<PaginatedResult<Transaction>>;
    findPendingTransactions(olderThan?: Date): Promise<Transaction[]>;
    getTotalVolumeByType(type: TransactionType, currency: string, fromDate?: Date, toDate?: Date): Promise<number>;
    getTransactionCount(status?: TransactionStatus, fromDate?: Date, toDate?: Date): Promise<number>;
    findReversals(originalTransactionId: string): Promise<Transaction[]>;
}
