"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const base_orm_entity_1 = require("../../../../core/infrastructure/base-orm-entity");
const orm_entities_1 = require("../../../ledger/infrastructure/orm-entities");
let AccountOrmEntity = class AccountOrmEntity extends base_orm_entity_1.BaseOrmEntity {
};
exports.AccountOrmEntity = AccountOrmEntity;
__decorate([
    (0, typeorm_1.Column)({ name: 'identity_account_id', type: 'uuid' }),
    __metadata("design:type", String)
], AccountOrmEntity.prototype, "identityAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], AccountOrmEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_name', length: 255 }),
    __metadata("design:type", String)
], AccountOrmEntity.prototype, "accountName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'account_type',
        type: 'enum',
        enum: orm_entities_1.AccountType,
        default: orm_entities_1.AccountType.ASSET
    }),
    __metadata("design:type", String)
], AccountOrmEntity.prototype, "accountType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], AccountOrmEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 19,
        scale: 4,
        default: 0,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        }
    }),
    __metadata("design:type", Number)
], AccountOrmEntity.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'credit_balance',
        type: 'decimal',
        precision: 19,
        scale: 4,
        default: 0,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        }
    }),
    __metadata("design:type", Number)
], AccountOrmEntity.prototype, "creditBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'debit_balance',
        type: 'decimal',
        precision: 19,
        scale: 4,
        default: 0,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        }
    }),
    __metadata("design:type", Number)
], AccountOrmEntity.prototype, "debitBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'normal_balance',
        type: 'enum',
        enum: orm_entities_1.NormalBalance,
        default: orm_entities_1.NormalBalance.DEBIT
    }),
    __metadata("design:type", String)
], AccountOrmEntity.prototype, "normalBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: orm_entities_1.AccountStatus,
        default: orm_entities_1.AccountStatus.ACTIVE
    }),
    __metadata("design:type", String)
], AccountOrmEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_account_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AccountOrmEntity.prototype, "parentAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_number', length: 50, nullable: true }),
    __metadata("design:type", String)
], AccountOrmEntity.prototype, "accountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'blnk_account_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], AccountOrmEntity.prototype, "blnkAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AccountOrmEntity.prototype, "metadata", void 0);
exports.AccountOrmEntity = AccountOrmEntity = __decorate([
    (0, typeorm_1.Entity)("accounts"),
    (0, typeorm_1.Index)(['identityAccountId']),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['accountType']),
    (0, typeorm_1.Index)(['currency']),
    (0, typeorm_1.Index)(['status'])
], AccountOrmEntity);
//# sourceMappingURL=account.orm-entity.js.map