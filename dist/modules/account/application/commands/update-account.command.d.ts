import { ICommandHandler } from "@nestjs/cqrs";
import { UpdateAccountUseCase } from "@modules/account/application/usecases/update-account.use-case";
import { UpdateAccountDto } from "@modules/account/application/dto/requests/update-account.dto";
export declare class UpdateAccountCommand {
    readonly contextId: string;
    readonly id: string;
    constructor(id: string, data: UpdateAccountDto, contextId: string);
}
export declare class UpdateAccountHandler implements ICommandHandler<UpdateAccountCommand> {
    private readonly useCase;
    constructor(useCase: UpdateAccountUseCase);
    execute(command: UpdateAccountCommand): Promise<import("../domain/entities").AccountEntity>;
}
