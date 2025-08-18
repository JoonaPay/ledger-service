import { TransactionRepository } from "@modules/transaction/infrastructure/repositories/transaction.repository";
import { DeleteTransactionCommand } from "@modules/transaction/application/commands/delete-transaction.command";
export declare class DeleteTransactionUseCase {
    private readonly repository;
    constructor(repository: TransactionRepository);
    execute(command: DeleteTransactionCommand): Promise<void>;
}
