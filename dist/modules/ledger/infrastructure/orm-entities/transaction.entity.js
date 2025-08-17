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
exports.TransactionOrmEntity = exports.ComplianceStatus = exports.TransactionSource = exports.TransactionStatus = exports.TransactionType = void 0;
const typeorm_1 = require("typeorm");
const ledger_account_entity_1 = require("./ledger-account.entity");
const transaction_entry_entity_1 = require("./transaction-entry.entity");
var TransactionType;
(function (TransactionType) {
    TransactionType["DEPOSIT"] = "DEPOSIT";
    TransactionType["WITHDRAWAL"] = "WITHDRAWAL";
    TransactionType["TRANSFER"] = "TRANSFER";
    TransactionType["FEE"] = "FEE";
    TransactionType["INTEREST"] = "INTEREST";
    TransactionType["ADJUSTMENT"] = "ADJUSTMENT";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["PROCESSING"] = "PROCESSING";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["CANCELLED"] = "CANCELLED";
    TransactionStatus["REVERSED"] = "REVERSED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var TransactionSource;
(function (TransactionSource) {
    TransactionSource["INTERNAL"] = "INTERNAL";
    TransactionSource["BANK_TRANSFER"] = "BANK_TRANSFER";
    TransactionSource["CARD"] = "CARD";
    TransactionSource["CRYPTO"] = "CRYPTO";
    TransactionSource["WIRE"] = "WIRE";
    TransactionSource["ACH"] = "ACH";
    TransactionSource["API"] = "API";
})(TransactionSource || (exports.TransactionSource = TransactionSource = {}));
var ComplianceStatus;
(function (ComplianceStatus) {
    ComplianceStatus["CLEAN"] = "CLEAN";
    ComplianceStatus["FLAGGED"] = "FLAGGED";
    ComplianceStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    ComplianceStatus["BLOCKED"] = "BLOCKED";
})(ComplianceStatus || (exports.ComplianceStatus = ComplianceStatus = {}));
let TransactionOrmEntity = class TransactionOrmEntity {
};
exports.TransactionOrmEntity = TransactionOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TransactionOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], TransactionOrmEntity.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_reference', length: 100, unique: true }),
    __metadata("design:type", String)
], TransactionOrmEntity.prototype, "transactionReference", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'transaction_type',
        type: 'enum',
        enum: TransactionType
    }),
    __metadata("design:type", String)
], TransactionOrmEntity.prototype, "transactionType", void 0);
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
], TransactionOrmEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], TransactionOrmEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TransactionOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'counterparty_account_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], TransactionOrmEntity.prototype, "counterpartyAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'counterparty_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], TransactionOrmEntity.prototype, "counterpartyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'counterparty_identifier', length: 255, nullable: true }),
    __metadata("design:type", String)
], TransactionOrmEntity.prototype, "counterpartyIdentifier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'blnk_transaction_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], TransactionOrmEntity.prototype, "blnkTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_reference', length: 255, nullable: true }),
    __metadata("design:type", String)
], TransactionOrmEntity.prototype, "externalReference", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransactionSource,
        default: TransactionSource.INTERNAL
    }),
    __metadata("design:type", String)
], TransactionOrmEntity.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING
    }),
    __metadata("design:type", String)
], TransactionOrmEntity.prototype, "status", void 0);
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
], TransactionOrmEntity.prototype, "balanceBefore", void 0);
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
], TransactionOrmEntity.prototype, "balanceAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'fee_amount',
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
], TransactionOrmEntity.prototype, "feeAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'exchange_rate',
        type: 'decimal',
        precision: 12,
        scale: 6,
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        }
    }),
    __metadata("design:type", Number)
], TransactionOrmEntity.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'original_amount',
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
], TransactionOrmEntity.prototype, "originalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_currency', length: 3, nullable: true }),
    __metadata("design:type", String)
], TransactionOrmEntity.prototype, "originalCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'settlement_date', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TransactionOrmEntity.prototype, "settlementDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'value_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], TransactionOrmEntity.prototype, "valueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'authorization_code', length: 50, nullable: true }),
    __metadata("design:type", String)
], TransactionOrmEntity.prototype, "authorizationCode", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'risk_score',
        type: 'decimal',
        precision: 5,
        scale: 2,
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value),
        }
    }),
    __metadata("design:type", Number)
], TransactionOrmEntity.prototype, "riskScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_flags', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TransactionOrmEntity.prototype, "riskFlags", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'compliance_status',
        type: 'enum',
        enum: ComplianceStatus,
        default: ComplianceStatus.CLEAN
    }),
    __metadata("design:type", String)
], TransactionOrmEntity.prototype, "complianceStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TransactionOrmEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], TransactionOrmEntity.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failed_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], TransactionOrmEntity.prototype, "failedReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reversal_transaction_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], TransactionOrmEntity.prototype, "reversalTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_reversal', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], TransactionOrmEntity.prototype, "isReversal", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TransactionOrmEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], TransactionOrmEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ledger_account_entity_1.LedgerAccountOrmEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'account_id' }),
    __metadata("design:type", ledger_account_entity_1.LedgerAccountOrmEntity)
], TransactionOrmEntity.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ledger_account_entity_1.LedgerAccountOrmEntity, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'counterparty_account_id' }),
    __metadata("design:type", ledger_account_entity_1.LedgerAccountOrmEntity)
], TransactionOrmEntity.prototype, "counterpartyAccount", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaction_entry_entity_1.TransactionEntryOrmEntity, entry => entry.transaction),
    __metadata("design:type", Array)
], TransactionOrmEntity.prototype, "entries", void 0);
exports.TransactionOrmEntity = TransactionOrmEntity = __decorate([
    (0, typeorm_1.Entity)('transactions'),
    (0, typeorm_1.Index)(['accountId']),
    (0, typeorm_1.Index)(['transactionReference']),
    (0, typeorm_1.Index)(['transactionType']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['counterpartyAccountId']),
    (0, typeorm_1.Index)(['blnkTransactionId']),
    (0, typeorm_1.Index)(['externalReference']),
    (0, typeorm_1.Index)(['source']),
    (0, typeorm_1.Index)(['complianceStatus']),
    (0, typeorm_1.Index)(['valueDate']),
    (0, typeorm_1.Index)(['processedAt']),
    (0, typeorm_1.Index)(['createdAt']),
    (0, typeorm_1.Index)(['isReversal', 'reversalTransactionId'])
], TransactionOrmEntity);
//# sourceMappingURL=transaction.entity.js.map