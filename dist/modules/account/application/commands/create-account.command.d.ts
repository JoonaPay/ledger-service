import { ICommandHandler } from "@nestjs/cqrs";
import { CreateAccountUseCase } from "@modules/account/application/usecases/create-account.use-case";
import { CreateAccountDto } from "@modules/account/application/dto/requests/create-account.dto";
import { AccountType, NormalBalance } from '@modules/ledger/infrastructure/orm-entities';
export declare class CreateAccountCommand {
    readonly contextId: string;
    readonly identityAccountId: string;
    readonly userId: string;
    readonly accountName: string;
    readonly accountType: AccountType;
    readonly currency: string;
    readonly normalBalance: NormalBalance;
    readonly parentAccountId?: string;
    readonly accountNumber?: string;
    readonly metadata?: Record<string, any>;
    constructor(data: CreateAccountDto, contextId: string);
}
export declare class CreateAccountHandler implements ICommandHandler<CreateAccountCommand> {
    private readonly useCase;
    constructor(useCase: CreateAccountUseCase);
    execute(command: CreateAccountCommand): Promise<import("../domain/entities").AccountEntity>;
}
