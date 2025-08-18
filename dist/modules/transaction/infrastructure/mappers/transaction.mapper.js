"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionMapper = void 0;
const transaction_orm_entity_1 = require("../orm-entities/transaction.orm-entity");
const transaction_entity_1 = require("../../domain/entities/transaction.entity");
const common_1 = require("@nestjs/common");
const base_mapper_1 = require("../../../../core/infrastructure/base-mapper");
let TransactionMapper = class TransactionMapper extends base_mapper_1.BaseMapper {
    toOrm(domainEntity) {
        if (!domainEntity) {
            throw new Error('Domain entity is required');
        }
        const ormEntity = new transaction_orm_entity_1.TransactionOrmEntity();
        ormEntity.id = domainEntity.id;
        ormEntity.created_at = domainEntity.createdAt;
        ormEntity.updated_at = domainEntity.updatedAt;
        return ormEntity;
    }
    toDomain(ormEntity) {
        const entity = new transaction_entity_1.TransactionEntity({
            id: ormEntity.id,
        });
        return entity;
    }
};
exports.TransactionMapper = TransactionMapper;
exports.TransactionMapper = TransactionMapper = __decorate([
    (0, common_1.Injectable)()
], TransactionMapper);
//# sourceMappingURL=transaction.mapper.js.map