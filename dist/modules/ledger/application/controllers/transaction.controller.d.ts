import { Repository } from 'typeorm';
import { TransactionOrmEntity, TransactionType, TransactionStatus, TransactionSource } from '../../infrastructure/orm-entities';
import { TransactionProcessorService } from '../domain/services/transaction-processor.service';
import { ProcessTransactionDto, ReverseTransactionDto } from '../dto/requests/process-transaction.dto';
import { TransactionDto, TransactionResultDto, TransactionSearchResultDto } from '../dto/responses/transaction.dto';
export declare class TransactionController {
    private readonly transactionRepository;
    private readonly transactionProcessor;
    private readonly logger;
    constructor(transactionRepository: Repository<TransactionOrmEntity>, transactionProcessor: TransactionProcessorService);
    processTransaction(processTransactionDto: ProcessTransactionDto): Promise<TransactionResultDto>;
    searchTransactions(accountId?: string, type?: TransactionType, status?: TransactionStatus, source?: TransactionSource, currency?: string, reference?: string, minAmount?: number, maxAmount?: number, startDate?: string, endDate?: string, limit?: number, offset?: number): Promise<TransactionSearchResultDto>;
    getTransaction(id: string): Promise<TransactionDto>;
    getTransactionStatus(id: string): Promise<TransactionResultDto | null>;
    reverseTransaction(id: string, reverseTransactionDto: ReverseTransactionDto): Promise<TransactionResultDto>;
    getTransactionByReference(reference: string): Promise<TransactionDto>;
    getAccountTransactions(accountId: string, limit?: number, offset?: number, status?: TransactionStatus): Promise<TransactionSearchResultDto>;
    getPendingTransactionsCount(): Promise<{
        count: number;
        totalAmount: number;
        currencies: Record<string, number>;
    }>;
    getRecentFailedTransactions(limit?: number): Promise<TransactionDto[]>;
    private mapToTransactionDto;
}
