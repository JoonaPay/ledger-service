import { AccountEntity } from "@modules/account/domain/entities/account.entity";
import { AccountRepository } from "@modules/account/infrastructure/repositories/account.repository";
export declare class GetAccountUseCase {
    private readonly repository;
    constructor(repository: AccountRepository);
    execute(id: string): Promise<AccountEntity>;
}
