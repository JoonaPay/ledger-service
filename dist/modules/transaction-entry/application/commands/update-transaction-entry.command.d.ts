import { ICommandHandler } from "@nestjs/cqrs";
import { UpdateTransactionEntryUseCase } from "@modules/transaction-entry/application/usecases/update-transaction-entry.use-case";
import { UpdateTransactionEntryDto } from "@modules/transaction-entry/application/dto/requests/update-transaction-entry.dto";
export declare class UpdateTransactionEntryCommand {
    readonly contextId: string;
    readonly id: string;
    constructor(id: string, data: UpdateTransactionEntryDto, contextId: string);
}
export declare class UpdateTransactionEntryHandler implements ICommandHandler<UpdateTransactionEntryCommand> {
    private readonly useCase;
    constructor(useCase: UpdateTransactionEntryUseCase);
    execute(command: UpdateTransactionEntryCommand): Promise<import("../domain/entities").TransactionEntryEntity>;
}
