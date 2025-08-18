import { Repository } from "typeorm";
import { AccountMapper } from "@modules/account/infrastructure/mappers/account.mapper";
import { AccountOrmEntity } from "@modules/account/infrastructure/orm-entities/account.orm-entity";
import { AccountEntity } from "@modules/account/domain/entities/account.entity";
export declare class AccountRepository {
    private readonly repository;
    private readonly mapper;
    constructor(repository: Repository<AccountOrmEntity>, mapper: AccountMapper);
    create(entity: AccountEntity): Promise<AccountEntity>;
    findById(id: string): Promise<AccountEntity | null>;
    findAll(): Promise<AccountEntity[]>;
    update(id: string, entity: AccountEntity): Promise<AccountEntity>;
    delete(id: string): Promise<void>;
}
