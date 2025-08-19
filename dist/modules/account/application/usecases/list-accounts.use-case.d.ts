import { AccountEntity } from "@modules/account/domain/entities/account.entity";
import { AccountRepository } from "@modules/account/infrastructure/repositories/account.repository";
export declare class ListAccountsUseCase {
    private readonly repository;
    constructor(repository: AccountRepository);
    execute(): Promise<AccountEntity[]>;
}
