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
exports.UpdateAccountDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const orm_entities_1 = require("../../../infrastructure/orm-entities");
class UpdateAccountDto {
}
exports.UpdateAccountDto = UpdateAccountDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Account name',
        example: 'John Doe Updated Account',
        minLength: 1,
        maxLength: 255,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], UpdateAccountDto.prototype, "accountName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Account status',
        enum: orm_entities_1.AccountStatus,
        example: orm_entities_1.AccountStatus.ACTIVE,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(orm_entities_1.AccountStatus),
    __metadata("design:type", typeof (_a = typeof orm_entities_1.AccountStatus !== "undefined" && orm_entities_1.AccountStatus) === "function" ? _a : Object)
], UpdateAccountDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata for the account',
        example: { updated: true, lastModified: '2024-01-01' },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateAccountDto.prototype, "metadata", void 0);
//# sourceMappingURL=update-account.dto.js.map