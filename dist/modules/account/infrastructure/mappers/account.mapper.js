"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountMapper = void 0;
const account_orm_entity_1 = require("../orm-entities/account.orm-entity");
const account_entity_1 = require("../../domain/entities/account.entity");
const common_1 = require("@nestjs/common");
const base_mapper_1 = require("../../../../core/infrastructure/base-mapper");
let AccountMapper = class AccountMapper extends base_mapper_1.BaseMapper {
    toOrm(domainEntity) {
        if (!domainEntity) {
            throw new Error('Domain entity is required');
        }
        const ormEntity = new account_orm_entity_1.AccountOrmEntity();
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
    toDomain(ormEntity) {
        const entity = new account_entity_1.AccountEntity({
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
};
exports.AccountMapper = AccountMapper;
exports.AccountMapper = AccountMapper = __decorate([
    (0, common_1.Injectable)()
], AccountMapper);
//# sourceMappingURL=account.mapper.js.map