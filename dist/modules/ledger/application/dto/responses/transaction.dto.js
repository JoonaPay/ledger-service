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
exports.TransactionSearchResultDto = exports.TransactionResultDto = exports.TransactionDto = exports.TransactionEntryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const orm_entities_1 = require("../../../infrastructure/orm-entities");
class TransactionEntryDto {
}
exports.TransactionEntryDto = TransactionEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account ID',
        example: 'acc_123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TransactionEntryDto.prototype, "accountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Entry amount',
        example: 100.50,
    }),
    __metadata("design:type", Number)
], TransactionEntryDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Entry type',
        enum: ['debit', 'credit'],
        example: 'debit',
    }),
    __metadata("design:type", String)
], TransactionEntryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Balance before this entry',
        example: 500.00,
    }),
    __metadata("design:type", Number)
], TransactionEntryDto.prototype, "balanceBefore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Balance after this entry',
        example: 600.50,
    }),
    __metadata("design:type", Number)
], TransactionEntryDto.prototype, "balanceAfter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Entry description',
        example: 'Payment for services',
    }),
    __metadata("design:type", String)
], TransactionEntryDto.prototype, "description", void 0);
class TransactionDto {
}
exports.TransactionDto = TransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction ID',
        example: 'txn_123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TransactionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction reference',
        example: 'TXN20240101001',
    }),
    __metadata("design:type", String)
], TransactionDto.prototype, "transactionReference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction type',
        enum: orm_entities_1.TransactionType,
        example: orm_entities_1.TransactionType.TRANSFER,
    }),
    __metadata("design:type", String)
], TransactionDto.prototype, "transactionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction amount',
        example: 100.50,
    }),
    __metadata("design:type", Number)
], TransactionDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Currency code',
        example: 'USD',
    }),
    __metadata("design:type", String)
], TransactionDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction description',
        example: 'Payment for services',
    }),
    __metadata("design:type", String)
], TransactionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Source account ID',
        example: 'acc_123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TransactionDto.prototype, "accountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Destination account ID',
        example: 'acc_789e4567-e89b-12d3-a456-426614174999',
    }),
    __metadata("design:type", String)
], TransactionDto.prototype, "counterpartyAccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Counterparty name',
        example: 'John Doe',
    }),
    __metadata("design:type", String)
], TransactionDto.prototype, "counterpartyName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'BlnkFinance transaction ID',
        example: 'blnk_txn_456',
    }),
    __metadata("design:type", String)
], TransactionDto.prototype, "blnkTransactionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'External reference',
        example: 'EXT_REF_12345',
    }),
    __metadata("design:type", String)
], TransactionDto.prototype, "externalReference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction source',
        enum: orm_entities_1.TransactionSource,
        example: orm_entities_1.TransactionSource.API,
    }),
    __metadata("design:type", String)
], TransactionDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction status',
        enum: orm_entities_1.TransactionStatus,
        example: orm_entities_1.TransactionStatus.COMPLETED,
    }),
    __metadata("design:type", String)
], TransactionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Balance before transaction',
        example: 500.00,
    }),
    __metadata("design:type", Number)
], TransactionDto.prototype, "balanceBefore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Balance after transaction',
        example: 600.50,
    }),
    __metadata("design:type", Number)
], TransactionDto.prototype, "balanceAfter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Fee amount',
        example: 2.50,
    }),
    __metadata("design:type", Number)
], TransactionDto.prototype, "feeAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Exchange rate (for currency conversions)',
        example: 1.0865,
    }),
    __metadata("design:type", Number)
], TransactionDto.prototype, "exchangeRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Settlement date',
        example: '2024-01-01T10:00:00Z',
    }),
    __metadata("design:type", Date)
], TransactionDto.prototype, "settlementDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Value date',
        example: '2024-01-01T10:00:00Z',
    }),
    __metadata("design:type", Date)
], TransactionDto.prototype, "valueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Risk score',
        example: 15.5,
    }),
    __metadata("design:type", Number)
], TransactionDto.prototype, "riskScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Compliance status',
        enum: orm_entities_1.ComplianceStatus,
        example: orm_entities_1.ComplianceStatus.CLEAN,
    }),
    __metadata("design:type", String)
], TransactionDto.prototype, "complianceStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Transaction metadata',
        example: { category: 'payment', orderId: 'ORD-12345' },
    }),
    __metadata("design:type", Object)
], TransactionDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Processing completion time',
        example: '2024-01-01T10:00:00Z',
    }),
    __metadata("design:type", Date)
], TransactionDto.prototype, "processedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Failure reason (if failed)',
        example: 'Insufficient funds',
    }),
    __metadata("design:type", String)
], TransactionDto.prototype, "failedReason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reversal transaction ID',
        example: 'txn_reversal_123',
    }),
    __metadata("design:type", String)
], TransactionDto.prototype, "reversalTransactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this is a reversal transaction',
        example: false,
    }),
    __metadata("design:type", Boolean)
], TransactionDto.prototype, "isReversal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction creation date',
        example: '2024-01-01T10:00:00Z',
    }),
    __metadata("design:type", Date)
], TransactionDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction last update date',
        example: '2024-01-01T10:00:00Z',
    }),
    __metadata("design:type", Date)
], TransactionDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Transaction entries (for double-entry details)',
        type: [TransactionEntryDto],
    }),
    __metadata("design:type", Array)
], TransactionDto.prototype, "entries", void 0);
class TransactionResultDto {
}
exports.TransactionResultDto = TransactionResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction ID',
        example: 'txn_123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TransactionResultDto.prototype, "transactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction reference',
        example: 'TXN20240101001',
    }),
    __metadata("design:type", String)
], TransactionResultDto.prototype, "reference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction status',
        enum: orm_entities_1.TransactionStatus,
        example: orm_entities_1.TransactionStatus.COMPLETED,
    }),
    __metadata("design:type", String)
], TransactionResultDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction amount',
        example: 100.50,
    }),
    __metadata("design:type", Number)
], TransactionResultDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Currency code',
        example: 'USD',
    }),
    __metadata("design:type", String)
], TransactionResultDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Source account ID',
        example: 'acc_123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], TransactionResultDto.prototype, "sourceAccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Destination account ID',
        example: 'acc_789e4567-e89b-12d3-a456-426614174999',
    }),
    __metadata("design:type", String)
], TransactionResultDto.prototype, "destinationAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction entries',
        type: [TransactionEntryDto],
    }),
    __metadata("design:type", Array)
], TransactionResultDto.prototype, "entries", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Transaction metadata',
        example: { category: 'payment', orderId: 'ORD-12345' },
    }),
    __metadata("design:type", Object)
], TransactionResultDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Processing completion time',
        example: '2024-01-01T10:00:00Z',
    }),
    __metadata("design:type", Date)
], TransactionResultDto.prototype, "processedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Failure reason (if failed)',
        example: 'Insufficient funds',
    }),
    __metadata("design:type", String)
], TransactionResultDto.prototype, "failedReason", void 0);
class TransactionSearchResultDto {
}
exports.TransactionSearchResultDto = TransactionSearchResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of transactions',
        type: [TransactionDto],
    }),
    __metadata("design:type", Array)
], TransactionSearchResultDto.prototype, "transactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of transactions matching criteria',
        example: 150,
    }),
    __metadata("design:type", Number)
], TransactionSearchResultDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of transactions returned',
        example: 20,
    }),
    __metadata("design:type", Number)
], TransactionSearchResultDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of transactions skipped',
        example: 0,
    }),
    __metadata("design:type", Number)
], TransactionSearchResultDto.prototype, "offset", void 0);
//# sourceMappingURL=transaction.dto.js.map