import { TransactionEntryRepository } from "@modules/transaction-entry/infrastructure/repositories/transaction-entry.repository";
import { DeleteTransactionEntryCommand } from "@modules/transaction-entry/application/commands/delete-transaction-entry.command";
export declare class DeleteTransactionEntryUseCase {
    private readonly repository;
    constructor(repository: TransactionEntryRepository);
    execute(command: DeleteTransactionEntryCommand): Promise<void>;
}
