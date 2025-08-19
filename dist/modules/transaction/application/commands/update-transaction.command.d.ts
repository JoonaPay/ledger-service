import { ICommandHandler } from "@nestjs/cqrs";
import { UpdateTransactionUseCase } from "@modules/transaction/application/usecases/update-transaction.use-case";
import { UpdateTransactionDto } from "@modules/transaction/application/dto/requests/update-transaction.dto";
export declare class UpdateTransactionCommand {
    readonly contextId: string;
    readonly id: string;
    constructor(id: string, data: UpdateTransactionDto, contextId: string);
}
export declare class UpdateTransactionHandler implements ICommandHandler<UpdateTransactionCommand> {
    private readonly useCase;
    constructor(useCase: UpdateTransactionUseCase);
    execute(command: UpdateTransactionCommand): Promise<void>;
}
