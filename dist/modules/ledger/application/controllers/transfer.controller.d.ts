import { TransactionProcessorService } from '../domain/services/transaction-processor.service';
import { TransactionResultDto } from '../dto/responses/transaction.dto';
declare class CreateTransferDto {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    currency: string;
    description: string;
    reference?: string;
    initiatedBy?: string;
    metadata?: Record<string, any>;
}
export declare class TransferController {
    private readonly transactionProcessor;
    private readonly logger;
    constructor(transactionProcessor: TransactionProcessorService);
    createTransfer(createTransferDto: CreateTransferDto): Promise<TransactionResultDto>;
    getTransfer(id: string): Promise<TransactionResultDto | null>;
    confirmTransfer(id: string): Promise<{
        message: string;
        transferId: string;
    }>;
}
export {};
