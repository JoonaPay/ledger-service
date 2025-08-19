import { TransactionEntity } from "@modules/transaction/domain/entities/transaction.entity";
import { TransactionRepository } from "@modules/transaction/infrastructure/repositories/transaction.repository";
export declare class GetTransactionUseCase {
    private readonly repository;
    constructor(repository: TransactionRepository);
    execute(id: string): Promise<TransactionEntity>;
}
