import { TransactionEntryEntity } from "@modules/transaction-entry/domain/entities/transaction-entry.entity";
import { TransactionEntryRepository } from "@modules/transaction-entry/infrastructure/repositories/transaction-entry.repository";
import { CreateTransactionEntryCommand } from "@modules/transaction-entry/application/commands/create-transaction-entry.command";
export declare class CreateTransactionEntryUseCase {
    private readonly repository;
    constructor(repository: TransactionEntryRepository);
    execute(command: CreateTransactionEntryCommand): Promise<TransactionEntryEntity>;
}
