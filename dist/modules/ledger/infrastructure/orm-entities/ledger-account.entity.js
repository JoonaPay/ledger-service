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
exports.LedgerAccountOrmEntity = exports.NormalBalance = exports.AccountStatus = exports.AccountType = void 0;
const typeorm_1 = require("typeorm");
const transaction_entity_1 = require("./transaction.entity");
const transaction_entry_entity_1 = require("./transaction-entry.entity");
const balance_snapshot_entity_1 = require("./balance-snapshot.entity");
const reconciliation_log_entity_1 = require("./reconciliation-log.entity");
var AccountType;
(function (AccountType) {
    AccountType["ASSET"] = "ASSET";
    AccountType["LIABILITY"] = "LIABILITY";
    AccountType["EQUITY"] = "EQUITY";
    AccountType["REVENUE"] = "REVENUE";
    AccountType["EXPENSE"] = "EXPENSE";
})(AccountType || (exports.AccountType = AccountType = {}));
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["ACTIVE"] = "ACTIVE";
    AccountStatus["SUSPENDED"] = "SUSPENDED";
    AccountStatus["CLOSED"] = "CLOSED";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
var NormalBalance;
(function (NormalBalance) {
    NormalBalance["DEBIT"] = "DEBIT";
    NormalBalance["CREDIT"] = "CREDIT";
})(NormalBalance || (exports.NormalBalance = NormalBalance = {}));
let LedgerAccountOrmEntity = class LedgerAccountOrmEntity {
};
exports.LedgerAccountOrmEntity = LedgerAccountOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LedgerAccountOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'identity_account_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LedgerAccountOrmEntity.prototype, "identityAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LedgerAccountOrmEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_name', length: 255 }),
    __metadata("design:type", String)
], LedgerAccountOrmEntity.prototype, "accountName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'account_type',
        type: 'enum',
        enum: AccountType,
        default: AccountType.ASSET
    }),
    __metadata("design:type", String)
], LedgerAccountOrmEntity.prototype, "accountType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], LedgerAccountOrmEntity.prototype, "currency", void 0);
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
], LedgerAccountOrmEntity.prototype, "balance", void 0);
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
], LedgerAccountOrmEntity.prototype, "creditBalance", void 0);
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
], LedgerAccountOrmEntity.prototype, "debitBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'blnk_account_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], LedgerAccountOrmEntity.prototype, "blnkAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_account_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], LedgerAccountOrmEntity.prototype, "parentAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_level', type: 'integer', default: 1 }),
    __metadata("design:type", Number)
], LedgerAccountOrmEntity.prototype, "accountLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_contra', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], LedgerAccountOrmEntity.prototype, "isContra", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'normal_balance',
        type: 'enum',
        enum: NormalBalance,
        default: NormalBalance.DEBIT
    }),
    __metadata("design:type", String)
], LedgerAccountOrmEntity.prototype, "normalBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], LedgerAccountOrmEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AccountStatus,
        default: AccountStatus.ACTIVE
    }),
    __metadata("design:type", String)
], LedgerAccountOrmEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], LedgerAccountOrmEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], LedgerAccountOrmEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], LedgerAccountOrmEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Date)
], LedgerAccountOrmEntity.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaction_entity_1.TransactionOrmEntity, transaction => transaction.account),
    __metadata("design:type", Array)
], LedgerAccountOrmEntity.prototype, "transactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaction_entity_1.TransactionOrmEntity, transaction => transaction.counterpartyAccount),
    __metadata("design:type", Array)
], LedgerAccountOrmEntity.prototype, "counterpartyTransactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaction_entry_entity_1.TransactionEntryOrmEntity, entry => entry.account),
    __metadata("design:type", Array)
], LedgerAccountOrmEntity.prototype, "transactionEntries", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => balance_snapshot_entity_1.BalanceSnapshotOrmEntity, snapshot => snapshot.account),
    __metadata("design:type", Array)
], LedgerAccountOrmEntity.prototype, "balanceSnapshots", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => reconciliation_log_entity_1.ReconciliationLogOrmEntity, log => log.account),
    __metadata("design:type", Array)
], LedgerAccountOrmEntity.prototype, "reconciliationLogs", void 0);
exports.LedgerAccountOrmEntity = LedgerAccountOrmEntity = __decorate([
    (0, typeorm_1.Entity)('ledger_accounts'),
    (0, typeorm_1.Index)(['identityAccountId']),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['accountType']),
    (0, typeorm_1.Index)(['currency']),
    (0, typeorm_1.Index)(['blnkAccountId']),
    (0, typeorm_1.Index)(['parentAccountId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['isActive', 'deletedAt'])
], LedgerAccountOrmEntity);
//# sourceMappingURL=ledger-account.entity.js.map