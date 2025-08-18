import { ICommandHandler } from "@nestjs/cqrs";
import { CreateTransactionEntryUseCase } from "@modules/transaction-entry/application/usecases/create-transaction-entry.use-case";
import { CreateTransactionEntryDto } from "@modules/transaction-entry/application/dto/requests/create-transaction-entry.dto";
export declare class CreateTransactionEntryCommand {
    readonly contextId: string;
    constructor(data: CreateTransactionEntryDto, contextId: string);
}
export declare class CreateTransactionEntryHandler implements ICommandHandler<CreateTransactionEntryCommand> {
    private readonly useCase;
    constructor(useCase: CreateTransactionEntryUseCase);
    execute(command: CreateTransactionEntryCommand): Promise<import("../domain/entities").TransactionEntryEntity>;
}
