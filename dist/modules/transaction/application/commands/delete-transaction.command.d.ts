import { ICommandHandler } from "@nestjs/cqrs";
import { DeleteTransactionUseCase } from "@modules/transaction/application/usecases/delete-transaction.use-case";
import { DeleteTransactionDto } from "@modules/transaction/application/dto/requests/delete-transaction.dto";
export declare class DeleteTransactionCommand {
    readonly contextId: string;
    readonly id: string;
    constructor(data: DeleteTransactionDto, contextId: string);
}
export declare class DeleteTransactionHandler implements ICommandHandler<DeleteTransactionCommand> {
    private readonly useCase;
    constructor(useCase: DeleteTransactionUseCase);
    execute(command: DeleteTransactionCommand): Promise<void>;
}
