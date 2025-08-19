"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionEntryMapper = void 0;
const transaction_entry_orm_entity_1 = require("../orm-entities/transaction-entry.orm-entity");
const common_1 = require("@nestjs/common");
const base_mapper_1 = require("../../../../core/infrastructure/base-mapper");
let TransactionEntryMapper = class TransactionEntryMapper extends base_mapper_1.BaseMapper {
    toDomain(ormEntity) {
        if (!ormEntity) {
            throw new Error('ORM entity is required');
        }
        throw new Error('Not implemented');
    }
    toOrm(domainEntity) {
        if (!domainEntity) {
            throw new Error('Domain entity is required');
        }
        const ormEntity = new transaction_entry_orm_entity_1.TransactionEntryOrmEntity();
        ormEntity.id = domainEntity.id;
        return ormEntity;
    }
};
exports.TransactionEntryMapper = TransactionEntryMapper;
exports.TransactionEntryMapper = TransactionEntryMapper = __decorate([
    (0, common_1.Injectable)()
], TransactionEntryMapper);
//# sourceMappingURL=transaction-entry.mapper.js.map