import { AccountRepository } from "@modules/account/infrastructure/repositories/account.repository";
import { DeleteAccountCommand } from "@modules/account/application/commands/delete-account.command";
export declare class DeleteAccountUseCase {
    private readonly repository;
    constructor(repository: AccountRepository);
    execute(command: DeleteAccountCommand): Promise<void>;
}
