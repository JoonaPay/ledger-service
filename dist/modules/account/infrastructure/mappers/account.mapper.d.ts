import { AccountOrmEntity } from "@modules/account/infrastructure/orm-entities/account.orm-entity";
import { AccountEntity } from "@modules/account/domain/entities/account.entity";
import { BaseMapper } from '@core/infrastructure/base-mapper';
export declare class AccountMapper extends BaseMapper<AccountEntity, AccountOrmEntity> {
    toOrm(domainEntity: AccountEntity): AccountOrmEntity;
    toDomain(ormEntity: AccountOrmEntity): AccountEntity;
}
