import { AccountOrmEntity } from "@modules/account/infrastructure/orm-entities/account.orm-entity";
import { AccountEntity } from "@modules/account/domain/entities/account.entity";
import { Injectable } from "@nestjs/common";
import { BaseMapper } from '@core/infrastructure/base-mapper';

@Injectable()
export class AccountMapper extends BaseMapper<AccountEntity, AccountOrmEntity> {
  toOrm(domainEntity: AccountEntity): AccountOrmEntity {
    if (!domainEntity) {
      throw new Error('Domain entity is required');
    }

    const ormEntity = new AccountOrmEntity();
    ormEntity.id = domainEntity.id;
    ormEntity.created_at = domainEntity.createdAt;
    ormEntity.updated_at = domainEntity.updatedAt;
    ormEntity.identityAccountId = domainEntity.identityAccountId;
    ormEntity.userId = domainEntity.userId;
    ormEntity.accountName = domainEntity.accountName;
    ormEntity.accountType = domainEntity.accountType;
    ormEntity.currency = domainEntity.currency;
    ormEntity.balance = domainEntity.balance;
    ormEntity.creditBalance = domainEntity.creditBalance;
    ormEntity.debitBalance = domainEntity.debitBalance;
    ormEntity.normalBalance = domainEntity.normalBalance;
    ormEntity.status = domainEntity.status;
    ormEntity.parentAccountId = domainEntity.parentAccountId;
    ormEntity.accountNumber = domainEntity.accountNumber;
    ormEntity.blnkAccountId = domainEntity.blnkAccountId;
    ormEntity.metadata = domainEntity.metadata;
    
    return ormEntity;
  }

  toDomain(ormEntity: AccountOrmEntity): AccountEntity {
    const entity = new AccountEntity({
      id: ormEntity.id,
      identityAccountId: ormEntity.identityAccountId,
      userId: ormEntity.userId,
      accountName: ormEntity.accountName,
      accountType: ormEntity.accountType,
      currency: ormEntity.currency,
      balance: ormEntity.balance,
      creditBalance: ormEntity.creditBalance,
      debitBalance: ormEntity.debitBalance,
      normalBalance: ormEntity.normalBalance,
      status: ormEntity.status,
      parentAccountId: ormEntity.parentAccountId,
      accountNumber: ormEntity.accountNumber,
      blnkAccountId: ormEntity.blnkAccountId,
      metadata: ormEntity.metadata,
    });
    
    return entity;
  }
}