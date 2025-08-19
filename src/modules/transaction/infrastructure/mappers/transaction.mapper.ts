import { TransactionOrmEntity } from "@modules/transaction/infrastructure/orm-entities/transaction.orm-entity";
import { TransactionEntity } from "@modules/transaction/domain/entities/transaction.entity";
import { Injectable } from "@nestjs/common";
import { BaseMapper } from '@core/infrastructure/base-mapper';

@Injectable()
export class TransactionMapper extends BaseMapper<TransactionEntity, TransactionOrmEntity> {
  toOrm(domainEntity: TransactionEntity): TransactionOrmEntity {
    if (!domainEntity) {
      throw new Error('Domain entity is required');
    }

    const ormEntity = new TransactionOrmEntity();
    ormEntity.id = domainEntity.id;
    ormEntity.created_at = domainEntity.createdAt;
    ormEntity.updated_at = domainEntity.updatedAt;
    // Map your properties from camelCase to snake_case
    // Example: ormEntity.amount = domainEntity.amount;
    // Example: ormEntity.description = domainEntity.description;
    
    return ormEntity;
  }

  toDomain(ormEntity: TransactionOrmEntity): TransactionEntity {
    // TODO: Implement proper mapping from ORM to domain entity
    throw new Error('Not implemented');
  }
}