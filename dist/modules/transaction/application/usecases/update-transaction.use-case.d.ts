import { TransactionRepository } from "@modules/transaction/infrastructure/repositories/transaction.repository";
import { UpdateTransactionCommand } from "@modules/transaction/application/commands/update-transaction.command";
export declare class UpdateTransactionUseCase {
    private readonly repository;
    constructor(repository: TransactionRepository);
    execute(command: UpdateTransactionCommand): Promise<void>;
}
