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
exports.TransactionEntryOrmEntity = exports.EntryType = void 0;
const typeorm_1 = require("typeorm");
const transaction_entity_1 = require("./transaction.entity");
const ledger_account_entity_1 = require("./ledger-account.entity");
var EntryType;
(function (EntryType) {
    EntryType["DEBIT"] = "DEBIT";
    EntryType["CREDIT"] = "CREDIT";
})(EntryType || (exports.EntryType = EntryType = {}));
let TransactionEntryOrmEntity = class TransactionEntryOrmEntity {
};
exports.TransactionEntryOrmEntity = TransactionEntryOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TransactionEntryOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], TransactionEntryOrmEntity.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], TransactionEntryOrmEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'entry_type',
        type: 'enum',
        enum: EntryType
    }),
    __metadata("design:type", String)
], TransactionEntryOrmEntity.prototype, "entryType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 19,
        scale: 4,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        }
    }),
    __metadata("design:type", Number)
], TransactionEntryOrmEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], TransactionEntryOrmEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TransactionEntryOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'balance_before',
        type: 'decimal',
        precision: 19,
        scale: 4,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        }
    }),
    __metadata("design:type", Number)
], TransactionEntryOrmEntity.prototype, "balanceBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'balance_after',
        type: 'decimal',
        precision: 19,
        scale: 4,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        }
    }),
    __metadata("design:type", Number)
], TransactionEntryOrmEntity.prototype, "balanceAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entry_sequence', type: 'integer' }),
    __metadata("design:type", Number)
], TransactionEntryOrmEntity.prototype, "entrySequence", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reversal_entry_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], TransactionEntryOrmEntity.prototype, "reversalEntryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_reversal', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], TransactionEntryOrmEntity.prototype, "isReversal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TransactionEntryOrmEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TransactionEntryOrmEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], TransactionEntryOrmEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transaction_entity_1.TransactionOrmEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'transaction_id' }),
    __metadata("design:type", transaction_entity_1.TransactionOrmEntity)
], TransactionEntryOrmEntity.prototype, "transaction", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ledger_account_entity_1.LedgerAccountOrmEntity, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'account_id' }),
    __metadata("design:type", ledger_account_entity_1.LedgerAccountOrmEntity)
], TransactionEntryOrmEntity.prototype, "account", void 0);
exports.TransactionEntryOrmEntity = TransactionEntryOrmEntity = __decorate([
    (0, typeorm_1.Entity)('transaction_entries'),
    (0, typeorm_1.Index)(['transactionId', 'entrySequence']),
    (0, typeorm_1.Index)(['accountId', 'createdAt']),
    (0, typeorm_1.Index)(['entryType']),
    (0, typeorm_1.Index)(['isReversal', 'reversalEntryId'])
], TransactionEntryOrmEntity);
//# sourceMappingURL=transaction-entry.entity.js.map