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
exports.BalanceSnapshotOrmEntity = exports.SnapshotType = void 0;
const typeorm_1 = require("typeorm");
const ledger_account_entity_1 = require("./ledger-account.entity");
var SnapshotType;
(function (SnapshotType) {
    SnapshotType["DAILY"] = "DAILY";
    SnapshotType["MONTHLY"] = "MONTHLY";
    SnapshotType["YEARLY"] = "YEARLY";
    SnapshotType["MANUAL"] = "MANUAL";
    SnapshotType["RECONCILIATION"] = "RECONCILIATION";
})(SnapshotType || (exports.SnapshotType = SnapshotType = {}));
let BalanceSnapshotOrmEntity = class BalanceSnapshotOrmEntity {
};
exports.BalanceSnapshotOrmEntity = BalanceSnapshotOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BalanceSnapshotOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], BalanceSnapshotOrmEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'snapshot_date', type: 'date' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], BalanceSnapshotOrmEntity.prototype, "snapshotDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'snapshot_time', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], BalanceSnapshotOrmEntity.prototype, "snapshotTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'opening_balance',
        type: 'decimal',
        precision: 19,
        scale: 4,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        }
    }),
    __metadata("design:type", Number)
], BalanceSnapshotOrmEntity.prototype, "openingBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'closing_balance',
        type: 'decimal',
        precision: 19,
        scale: 4,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        }
    }),
    __metadata("design:type", Number)
], BalanceSnapshotOrmEntity.prototype, "closingBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total_debits',
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
], BalanceSnapshotOrmEntity.prototype, "totalDebits", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total_credits',
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
], BalanceSnapshotOrmEntity.prototype, "totalCredits", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_count', type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], BalanceSnapshotOrmEntity.prototype, "transactionCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], BalanceSnapshotOrmEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'snapshot_type',
        type: 'enum',
        enum: SnapshotType,
        default: SnapshotType.DAILY
    }),
    __metadata("design:type", String)
], BalanceSnapshotOrmEntity.prototype, "snapshotType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_reconciled', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], BalanceSnapshotOrmEntity.prototype, "isReconciled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reconciled_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BalanceSnapshotOrmEntity.prototype, "reconciledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reconciled_by', length: 255, nullable: true }),
    __metadata("design:type", String)
], BalanceSnapshotOrmEntity.prototype, "reconciledBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'variance_amount',
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
], BalanceSnapshotOrmEntity.prototype, "varianceAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'variance_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], BalanceSnapshotOrmEntity.prototype, "varianceReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], BalanceSnapshotOrmEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BalanceSnapshotOrmEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BalanceSnapshotOrmEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ledger_account_entity_1.LedgerAccountOrmEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'account_id' }),
    __metadata("design:type", ledger_account_entity_1.LedgerAccountOrmEntity)
], BalanceSnapshotOrmEntity.prototype, "account", void 0);
exports.BalanceSnapshotOrmEntity = BalanceSnapshotOrmEntity = __decorate([
    (0, typeorm_1.Entity)('balance_snapshots'),
    (0, typeorm_1.Index)(['accountId', 'snapshotDate']),
    (0, typeorm_1.Index)(['snapshotType']),
    (0, typeorm_1.Index)(['currency']),
    (0, typeorm_1.Index)(['isReconciled']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Unique)(['accountId', 'snapshotDate'])
], BalanceSnapshotOrmEntity);
//# sourceMappingURL=balance-snapshot.entity.js.map