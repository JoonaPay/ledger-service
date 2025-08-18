import { TransactionEntryOrmEntity } from "@modules/transaction-entry/infrastructure/orm-entities/transaction-entry.orm-entity";
import { TransactionEntryEntity } from "@modules/transaction-entry/domain/entities/transaction-entry.entity";
import { BaseMapper } from '@core/infrastructure/base-mapper';
export declare class TransactionEntryMapper extends BaseMapper<TransactionEntryEntity, TransactionEntryOrmEntity> {
    toDomain(ormEntity: TransactionEntryOrmEntity): TransactionEntryEntity;
    toOrm(domainEntity: TransactionEntryEntity): TransactionEntryOrmEntity;
}
