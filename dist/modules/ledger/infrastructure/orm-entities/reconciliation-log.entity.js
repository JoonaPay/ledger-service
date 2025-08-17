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
exports.ReconciliationLogOrmEntity = exports.BlnkSyncStatus = exports.ResolutionAction = exports.ReconciliationStatus = exports.ReconciliationType = void 0;
const typeorm_1 = require("typeorm");
const ledger_account_entity_1 = require("./ledger-account.entity");
const transaction_entity_1 = require("./transaction.entity");
var ReconciliationType;
(function (ReconciliationType) {
    ReconciliationType["DAILY"] = "DAILY";
    ReconciliationType["MONTHLY"] = "MONTHLY";
    ReconciliationType["MANUAL"] = "MANUAL";
    ReconciliationType["EXTERNAL_BLNK"] = "EXTERNAL_BLNK";
    ReconciliationType["BANK_STATEMENT"] = "BANK_STATEMENT";
})(ReconciliationType || (exports.ReconciliationType = ReconciliationType = {}));
var ReconciliationStatus;
(function (ReconciliationStatus) {
    ReconciliationStatus["PENDING"] = "PENDING";
    ReconciliationStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ReconciliationStatus["RECONCILED"] = "RECONCILED";
    ReconciliationStatus["FAILED"] = "FAILED";
    ReconciliationStatus["MANUAL_REVIEW"] = "MANUAL_REVIEW";
})(ReconciliationStatus || (exports.ReconciliationStatus = ReconciliationStatus = {}));
var ResolutionAction;
(function (ResolutionAction) {
    ResolutionAction["NO_ACTION"] = "NO_ACTION";
    ResolutionAction["ADJUSTMENT_MADE"] = "ADJUSTMENT_MADE";
    ResolutionAction["EXTERNAL_CORRECTION"] = "EXTERNAL_CORRECTION";
    ResolutionAction["PENDING_INVESTIGATION"] = "PENDING_INVESTIGATION";
})(ResolutionAction || (exports.ResolutionAction = ResolutionAction = {}));
var BlnkSyncStatus;
(function (BlnkSyncStatus) {
    BlnkSyncStatus["SYNCED"] = "SYNCED";
    BlnkSyncStatus["OUT_OF_SYNC"] = "OUT_OF_SYNC";
    BlnkSyncStatus["ERROR"] = "ERROR";
    BlnkSyncStatus["NOT_APPLICABLE"] = "NOT_APPLICABLE";
})(BlnkSyncStatus || (exports.BlnkSyncStatus = BlnkSyncStatus = {}));
let ReconciliationLogOrmEntity = class ReconciliationLogOrmEntity {
};
exports.ReconciliationLogOrmEntity = ReconciliationLogOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ReconciliationLogOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ReconciliationLogOrmEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reconciliation_date', type: 'date' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], ReconciliationLogOrmEntity.prototype, "reconciliationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'reconciliation_type',
        type: 'enum',
        enum: ReconciliationType
    }),
    __metadata("design:type", String)
], ReconciliationLogOrmEntity.prototype, "reconciliationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_source', length: 100, nullable: true }),
    __metadata("design:type", String)
], ReconciliationLogOrmEntity.prototype, "externalSource", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'internal_balance',
        type: 'decimal',
        precision: 19,
        scale: 4,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        }
    }),
    __metadata("design:type", Number)
], ReconciliationLogOrmEntity.prototype, "internalBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'external_balance',
        type: 'decimal',
        precision: 19,
        scale: 4,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        }
    }),
    __metadata("design:type", Number)
], ReconciliationLogOrmEntity.prototype, "externalBalance", void 0);
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
], ReconciliationLogOrmEntity.prototype, "varianceAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'variance_percentage',
        type: 'decimal',
        precision: 8,
        scale: 4,
        default: 0,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        }
    }),
    __metadata("design:type", Number)
], ReconciliationLogOrmEntity.prototype, "variancePercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], ReconciliationLogOrmEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ReconciliationStatus,
        default: ReconciliationStatus.PENDING
    }),
    __metadata("design:type", String)
], ReconciliationLogOrmEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reconciled_by', length: 255, nullable: true }),
    __metadata("design:type", String)
], ReconciliationLogOrmEntity.prototype, "reconciledBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reconciled_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ReconciliationLogOrmEntity.prototype, "reconciledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'variance_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ReconciliationLogOrmEntity.prototype, "varianceReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolution_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ReconciliationLogOrmEntity.prototype, "resolutionNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'resolution_action',
        type: 'enum',
        enum: ResolutionAction,
        nullable: true
    }),
    __metadata("design:type", String)
], ReconciliationLogOrmEntity.prototype, "resolutionAction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adjustment_transaction_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ReconciliationLogOrmEntity.prototype, "adjustmentTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_reference', length: 255, nullable: true }),
    __metadata("design:type", String)
], ReconciliationLogOrmEntity.prototype, "externalReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'blnk_account_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], ReconciliationLogOrmEntity.prototype, "blnkAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'blnk_balance',
        type: 'decimal',
        precision: 19,
        scale: 4,
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        }
    }),
    __metadata("design:type", Number)
], ReconciliationLogOrmEntity.prototype, "blnkBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'blnk_sync_status',
        type: 'enum',
        enum: BlnkSyncStatus,
        default: BlnkSyncStatus.NOT_APPLICABLE
    }),
    __metadata("design:type", String)
], ReconciliationLogOrmEntity.prototype, "blnkSyncStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_count_internal', type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], ReconciliationLogOrmEntity.prototype, "transactionCountInternal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_count_external', type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], ReconciliationLogOrmEntity.prototype, "transactionCountExternal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_transaction_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ReconciliationLogOrmEntity.prototype, "lastTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reconciliation_window_start', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ReconciliationLogOrmEntity.prototype, "reconciliationWindowStart", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reconciliation_window_end', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ReconciliationLogOrmEntity.prototype, "reconciliationWindowEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tolerance_amount',
        type: 'decimal',
        precision: 19,
        scale: 4,
        default: 0.01,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        }
    }),
    __metadata("design:type", Number)
], ReconciliationLogOrmEntity.prototype, "toleranceAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_within_tolerance', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ReconciliationLogOrmEntity.prototype, "isWithinTolerance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requires_attention', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ReconciliationLogOrmEntity.prototype, "requiresAttention", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ReconciliationLogOrmEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ReconciliationLogOrmEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ReconciliationLogOrmEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ledger_account_entity_1.LedgerAccountOrmEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'account_id' }),
    __metadata("design:type", ledger_account_entity_1.LedgerAccountOrmEntity)
], ReconciliationLogOrmEntity.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transaction_entity_1.TransactionOrmEntity, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'adjustment_transaction_id' }),
    __metadata("design:type", transaction_entity_1.TransactionOrmEntity)
], ReconciliationLogOrmEntity.prototype, "adjustmentTransaction", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transaction_entity_1.TransactionOrmEntity, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'last_transaction_id' }),
    __metadata("design:type", transaction_entity_1.TransactionOrmEntity)
], ReconciliationLogOrmEntity.prototype, "lastTransaction", void 0);
exports.ReconciliationLogOrmEntity = ReconciliationLogOrmEntity = __decorate([
    (0, typeorm_1.Entity)('reconciliation_logs'),
    (0, typeorm_1.Index)(['accountId', 'reconciliationDate']),
    (0, typeorm_1.Index)(['reconciliationType']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['currency']),
    (0, typeorm_1.Index)(['isWithinTolerance', 'requiresAttention']),
    (0, typeorm_1.Index)(['blnkSyncStatus']),
    (0, typeorm_1.Index)(['externalReference']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Index)(['accountId', 'reconciliationDate', 'reconciliationType'])
], ReconciliationLogOrmEntity);
//# sourceMappingURL=reconciliation-log.entity.js.map