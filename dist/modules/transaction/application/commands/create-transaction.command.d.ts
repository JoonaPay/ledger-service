import { ICommandHandler } from "@nestjs/cqrs";
import { CreateTransactionUseCase } from "@modules/transaction/application/usecases/create-transaction.use-case";
import { CreateTransactionDto } from "@modules/transaction/application/dto/requests/create-transaction.dto";
export declare class CreateTransactionCommand {
    readonly contextId: string;
    constructor(data: CreateTransactionDto, contextId: string);
}
export declare class CreateTransactionHandler implements ICommandHandler<CreateTransactionCommand> {
    private readonly useCase;
    constructor(useCase: CreateTransactionUseCase);
    execute(command: CreateTransactionCommand): Promise<void>;
}
