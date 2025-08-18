import { TransactionOrmEntity } from "@modules/transaction/infrastructure/orm-entities/transaction.orm-entity";
import { TransactionEntity } from "@modules/transaction/domain/entities/transaction.entity";
import { BaseMapper } from '@core/infrastructure/base-mapper';
export declare class TransactionMapper extends BaseMapper<TransactionEntity, TransactionOrmEntity> {
    toOrm(domainEntity: TransactionEntity): TransactionOrmEntity;
    toDomain(ormEntity: TransactionOrmEntity): TransactionEntity;
}
