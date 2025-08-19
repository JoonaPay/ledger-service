import { TransactionEntity } from "@modules/transaction/domain/entities/transaction.entity";
import { TransactionRepository } from "@modules/transaction/infrastructure/repositories/transaction.repository";
export declare class ListTransactionsUseCase {
    private readonly repository;
    constructor(repository: TransactionRepository);
    execute(): Promise<TransactionEntity[]>;
}
