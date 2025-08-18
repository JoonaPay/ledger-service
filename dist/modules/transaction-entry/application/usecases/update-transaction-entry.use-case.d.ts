import { TransactionEntryEntity } from "@modules/transaction-entry/domain/entities/transaction-entry.entity";
import { TransactionEntryRepository } from "@modules/transaction-entry/infrastructure/repositories/transaction-entry.repository";
import { UpdateTransactionEntryCommand } from "@modules/transaction-entry/application/commands/update-transaction-entry.command";
export declare class UpdateTransactionEntryUseCase {
    private readonly repository;
    constructor(repository: TransactionEntryRepository);
    execute(command: UpdateTransactionEntryCommand): Promise<TransactionEntryEntity>;
}
