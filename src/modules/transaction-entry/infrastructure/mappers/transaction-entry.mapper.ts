import { TransactionEntryOrmEntity } from "@modules/transaction-entry/infrastructure/orm-entities/transaction-entry.orm-entity";
import { TransactionEntryEntity } from "@modules/transaction-entry/domain/entities/transaction-entry.entity";
import { Injectable } from "@nestjs/common";
import { BaseMapper } from '@core/infrastructure/base-mapper';

@Injectable()
export class TransactionEntryMapper extends BaseMapper<TransactionEntryEntity, TransactionEntryOrmEntity> {
  toDomain(ormEntity: TransactionEntryOrmEntity): TransactionEntryEntity {
    if (!ormEntity) {
      throw new Error('ORM entity is required');
    }

    return new TransactionEntryEntity({
      id: ormEntity.id,
      // Map your properties from snake_case to camelCase
      // Example: amount: ormEntity.amount,
      // Example: accountId: ormEntity.account_id,
    });
  }

  toOrm(domainEntity: TransactionEntryEntity): TransactionEntryOrmEntity {
    if (!domainEntity) {
      throw new Error('Domain entity is required');
    }

    const ormEntity = new TransactionEntryOrmEntity();
    ormEntity.id = domainEntity.id;
    // Map your properties from camelCase to snake_case
    // Example: ormEntity.amount = domainEntity.amount;
    // Example: ormEntity.account_id = domainEntity.accountId;
    
    return ormEntity;
  }
}