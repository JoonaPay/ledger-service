import { AccountEntity } from "@modules/account/domain/entities/account.entity";
import { AccountRepository } from "@modules/account/infrastructure/repositories/account.repository";
import { CreateAccountCommand } from "@modules/account/application/commands/create-account.command";
export declare class CreateAccountUseCase {
    private readonly repository;
    constructor(repository: AccountRepository);
    execute(command: CreateAccountCommand): Promise<AccountEntity>;
}
