import { ICommandHandler } from "@nestjs/cqrs";
import { CreateAccountUseCase } from "@modules/account/application/usecases/create-account.use-case";
import { CreateAccountDto } from "@modules/account/application/dto/requests/create-account.dto";
export declare class CreateAccountCommand {
    readonly contextId: string;
    constructor(data: CreateAccountDto, contextId: string);
}
export declare class CreateAccountHandler implements ICommandHandler<CreateAccountCommand> {
    private readonly useCase;
    constructor(useCase: CreateAccountUseCase);
    execute(command: CreateAccountCommand): Promise<import("../domain/entities").AccountEntity>;
}
