import { TransactionEntity } from "@modules/transaction/domain/entities/transaction.entity";
import { TransactionRepository } from "@modules/transaction/infrastructure/repositories/transaction.repository";
import { CreateTransactionCommand } from "@modules/transaction/application/commands/create-transaction.command";
export declare class CreateTransactionUseCase {
    private readonly repository;
    constructor(repository: TransactionRepository);
    execute(command: CreateTransactionCommand): Promise<TransactionEntity>;
}
