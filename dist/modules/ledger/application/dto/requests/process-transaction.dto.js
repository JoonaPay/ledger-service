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
exports.ReverseTransactionDto = exports.ProcessTransactionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const orm_entities_1 = require("../../../infrastructure/orm-entities");
class ProcessTransactionDto {
}
exports.ProcessTransactionDto = ProcessTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction type',
        enum: orm_entities_1.TransactionType,
        example: orm_entities_1.TransactionType.TRANSFER,
    }),
    (0, class_validator_1.IsEnum)(orm_entities_1.TransactionType),
    __metadata("design:type", String)
], ProcessTransactionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction amount',
        example: 100.50,
        minimum: 0.01,
    }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], ProcessTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Currency code (ISO 4217)',
        example: 'USD',
        minLength: 3,
        maxLength: 3,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 3),
    __metadata("design:type", String)
], ProcessTransactionDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction description',
        example: 'Payment for services',
        minLength: 1,
        maxLength: 500,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 500),
    __metadata("design:type", String)
], ProcessTransactionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Source account ID (for withdrawals and transfers)',
        example: 'acc_123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ProcessTransactionDto.prototype, "sourceAccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Destination account ID (for deposits and transfers)',
        example: 'acc_789e4567-e89b-12d3-a456-426614174999',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ProcessTransactionDto.prototype, "destinationAccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Transaction reference (auto-generated if not provided)',
        example: 'TXN20240101001',
        maxLength: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], ProcessTransactionDto.prototype, "reference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'External reference from source system',
        example: 'EXT_REF_12345',
        maxLength: 255,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], ProcessTransactionDto.prototype, "externalReference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Transaction source',
        enum: orm_entities_1.TransactionSource,
        example: orm_entities_1.TransactionSource.API,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(orm_entities_1.TransactionSource),
    __metadata("design:type", String)
], ProcessTransactionDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User or system that initiated the transaction',
        example: 'user_123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProcessTransactionDto.prototype, "initiatedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata for the transaction',
        example: { category: 'payment', orderId: 'ORD-12345' },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ProcessTransactionDto.prototype, "metadata", void 0);
class ReverseTransactionDto {
}
exports.ReverseTransactionDto = ReverseTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for reversal',
        example: 'Customer requested refund',
        minLength: 1,
        maxLength: 500,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 500),
    __metadata("design:type", String)
], ReverseTransactionDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'User or system that initiated the reversal',
        example: 'user_123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReverseTransactionDto.prototype, "initiatedBy", void 0);
//# sourceMappingURL=process-transaction.dto.js.map