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
exports.AccountStatementDto = exports.AccountBalanceDto = exports.AccountDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const orm_entities_1 = require("../../../infrastructure/orm-entities");
class AccountDto {
}
exports.AccountDto = AccountDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account ID',
        example: 'acc_123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], AccountDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Identity service account ID',
        example: 'identity_acc_123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], AccountDto.prototype, "identityAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID',
        example: 'user_123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], AccountDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account name',
        example: 'John Doe Main Account',
    }),
    __metadata("design:type", String)
], AccountDto.prototype, "accountName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account type',
        enum: orm_entities_1.AccountType,
        example: orm_entities_1.AccountType.ASSET,
    }),
    __metadata("design:type", String)
], AccountDto.prototype, "accountType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Currency code',
        example: 'USD',
    }),
    __metadata("design:type", String)
], AccountDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current balance',
        example: 1250.75,
    }),
    __metadata("design:type", Number)
], AccountDto.prototype, "balance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total credit balance',
        example: 5000.00,
    }),
    __metadata("design:type", Number)
], AccountDto.prototype, "creditBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total debit balance',
        example: 3749.25,
    }),
    __metadata("design:type", Number)
], AccountDto.prototype, "debitBalance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'BlnkFinance account ID',
        example: 'blnk_acc_789',
    }),
    __metadata("design:type", String)
], AccountDto.prototype, "blnkAccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Parent account ID',
        example: 'acc_parent123-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], AccountDto.prototype, "parentAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account level in hierarchy',
        example: 1,
    }),
    __metadata("design:type", Number)
], AccountDto.prototype, "accountLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this is a contra account',
        example: false,
    }),
    __metadata("design:type", Boolean)
], AccountDto.prototype, "isContra", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Normal balance type',
        enum: orm_entities_1.NormalBalance,
        example: orm_entities_1.NormalBalance.DEBIT,
    }),
    __metadata("design:type", String)
], AccountDto.prototype, "normalBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account status',
        enum: orm_entities_1.AccountStatus,
        example: orm_entities_1.AccountStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], AccountDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the account is active',
        example: true,
    }),
    __metadata("design:type", Boolean)
], AccountDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata',
        example: { purpose: 'savings', category: 'personal' },
    }),
    __metadata("design:type", Object)
], AccountDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account creation date',
        example: '2024-01-01T10:00:00Z',
    }),
    __metadata("design:type", Date)
], AccountDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account last update date',
        example: '2024-01-01T10:00:00Z',
    }),
    __metadata("design:type", Date)
], AccountDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Account deletion date (if soft deleted)',
        example: null,
    }),
    __metadata("design:type", Date)
], AccountDto.prototype, "deletedAt", void 0);
class AccountBalanceDto {
}
exports.AccountBalanceDto = AccountBalanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account ID',
        example: 'acc_123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], AccountBalanceDto.prototype, "accountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current balance',
        example: 1250.75,
    }),
    __metadata("design:type", Number)
], AccountBalanceDto.prototype, "currentBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Available balance (after pending transactions)',
        example: 1200.75,
    }),
    __metadata("design:type", Number)
], AccountBalanceDto.prototype, "availableBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Pending balance (transactions in process)',
        example: 50.00,
    }),
    __metadata("design:type", Number)
], AccountBalanceDto.prototype, "pendingBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total debits',
        example: 3749.25,
    }),
    __metadata("design:type", Number)
], AccountBalanceDto.prototype, "totalDebits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total credits',
        example: 5000.00,
    }),
    __metadata("design:type", Number)
], AccountBalanceDto.prototype, "totalCredits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Currency code',
        example: 'USD',
    }),
    __metadata("design:type", String)
], AccountBalanceDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-01-01T10:00:00Z',
    }),
    __metadata("design:type", Date)
], AccountBalanceDto.prototype, "lastUpdated", void 0);
class AccountStatementDto {
}
exports.AccountStatementDto = AccountStatementDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account ID',
        example: 'acc_123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], AccountStatementDto.prototype, "accountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Statement period start',
        example: '2024-01-01T00:00:00Z',
    }),
    __metadata("design:type", Date)
], AccountStatementDto.prototype, "periodStart", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Statement period end',
        example: '2024-01-31T23:59:59Z',
    }),
    __metadata("design:type", Date)
], AccountStatementDto.prototype, "periodEnd", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Opening balance',
        example: 1000.00,
    }),
    __metadata("design:type", Number)
], AccountStatementDto.prototype, "openingBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Closing balance',
        example: 1250.75,
    }),
    __metadata("design:type", Number)
], AccountStatementDto.prototype, "closingBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total debits in period',
        example: 500.00,
    }),
    __metadata("design:type", Number)
], AccountStatementDto.prototype, "totalDebits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total credits in period',
        example: 750.75,
    }),
    __metadata("design:type", Number)
], AccountStatementDto.prototype, "totalCredits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of transactions',
        example: 15,
    }),
    __metadata("design:type", Number)
], AccountStatementDto.prototype, "transactionCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Currency code',
        example: 'USD',
    }),
    __metadata("design:type", String)
], AccountStatementDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Statement transactions',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                transactionId: { type: 'string' },
                date: { type: 'string', format: 'date-time' },
                amount: { type: 'number' },
                type: { type: 'string' },
                description: { type: 'string' },
                balance: { type: 'number' },
            },
        },
    }),
    __metadata("design:type", Array)
], AccountStatementDto.prototype, "transactions", void 0);
//# sourceMappingURL=account.dto.js.map