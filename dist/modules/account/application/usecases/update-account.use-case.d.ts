import { AccountRepository } from "@modules/account/infrastructure/repositories/account.repository";
import { UpdateAccountCommand } from "@modules/account/application/commands/update-account.command";
export declare class UpdateAccountUseCase {
    private readonly repository;
    constructor(repository: AccountRepository);
    execute(command: UpdateAccountCommand): Promise<void>;
}
