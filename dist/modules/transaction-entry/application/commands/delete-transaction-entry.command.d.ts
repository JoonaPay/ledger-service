import { ICommandHandler } from "@nestjs/cqrs";
import { DeleteTransactionEntryUseCase } from "@modules/transaction-entry/application/usecases/delete-transaction-entry.use-case";
import { DeleteTransactionEntryDto } from "@modules/transaction-entry/application/dto/requests/delete-transaction-entry.dto";
export declare class DeleteTransactionEntryCommand {
    readonly contextId: string;
    readonly id: string;
    constructor(data: DeleteTransactionEntryDto, contextId: string);
}
export declare class DeleteTransactionEntryHandler implements ICommandHandler<DeleteTransactionEntryCommand> {
    private readonly useCase;
    constructor(useCase: DeleteTransactionEntryUseCase);
    execute(command: DeleteTransactionEntryCommand): Promise<void>;
}
