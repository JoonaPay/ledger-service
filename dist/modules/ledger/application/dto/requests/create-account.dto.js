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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAccountDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const orm_entities_1 = require("../../../infrastructure/orm-entities");
class CreateAccountDto {
}
exports.CreateAccountDto = CreateAccountDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Identity service account ID',
        example: 'acc_123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAccountDto.prototype, "identityAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID from identity service',
        example: 'user_123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAccountDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account name',
        example: 'John Doe Main Account',
        minLength: 1,
        maxLength: 255,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], CreateAccountDto.prototype, "accountName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account type',
        enum: orm_entities_1.AccountType,
        example: orm_entities_1.AccountType.ASSET,
    }),
    (0, class_validator_1.IsEnum)(orm_entities_1.AccountType),
    __metadata("design:type", typeof (_a = typeof orm_entities_1.AccountType !== "undefined" && orm_entities_1.AccountType) === "function" ? _a : Object)
], CreateAccountDto.prototype, "accountType", void 0);
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
], CreateAccountDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Initial balance',
        example: 100.00,
        minimum: 0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateAccountDto.prototype, "initialBalance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Parent account ID for hierarchical accounts',
        example: 'acc_parent123-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAccountDto.prototype, "parentAccountId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Account level in hierarchy',
        example: 1,
        minimum: 1,
        maximum: 10,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], CreateAccountDto.prototype, "accountLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether this is a contra account',
        example: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateAccountDto.prototype, "isContra", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata for the account',
        example: { purpose: 'savings', category: 'personal' },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateAccountDto.prototype, "metadata", void 0);
//# sourceMappingURL=create-account.dto.js.map