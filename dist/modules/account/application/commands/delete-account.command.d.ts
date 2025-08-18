import { ICommandHandler } from "@nestjs/cqrs";
import { DeleteAccountUseCase } from "@modules/account/application/usecases/delete-account.use-case";
import { DeleteAccountDto } from "@modules/account/application/dto/requests/delete-account.dto";
export declare class DeleteAccountCommand {
    readonly contextId: string;
    readonly id: string;
    constructor(data: DeleteAccountDto, contextId: string);
}
export declare class DeleteAccountHandler implements ICommandHandler<DeleteAccountCommand> {
    private readonly useCase;
    constructor(useCase: DeleteAccountUseCase);
    execute(command: DeleteAccountCommand): Promise<void>;
}
