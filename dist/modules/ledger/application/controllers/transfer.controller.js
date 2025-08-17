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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TransferController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const transaction_processor_service_1 = require("../domain/services/transaction-processor.service");
const orm_entities_1 = require("../../infrastructure/orm-entities");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
const transaction_dto_1 = require("../dto/responses/transaction.dto");
class CreateTransferDto {
}
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'Source account ID',
        example: 'acc_123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "sourceAccountId", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'Destination account ID',
        example: 'acc_789e4567-e89b-12d3-a456-426614174999',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "destinationAccountId", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'Transfer amount',
        example: 100.50,
        minimum: 0.01,
    }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateTransferDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'Currency code (ISO 4217)',
        example: 'USD',
        minLength: 3,
        maxLength: 3,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 3),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_2.ApiProperty)({
        description: 'Transfer description',
        example: 'Transfer to savings account',
        minLength: 1,
        maxLength: 500,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 500),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "description", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        description: 'Transfer reference (auto-generated if not provided)',
        example: 'TFR20240101001',
        maxLength: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "reference", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        description: 'User or system that initiated the transfer',
        example: 'user_123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferDto.prototype, "initiatedBy", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        description: 'Additional metadata for the transfer',
        example: { category: 'internal', purpose: 'savings' },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateTransferDto.prototype, "metadata", void 0);
class JwtAuthGuard {
}
let TransferController = TransferController_1 = class TransferController {
    constructor(transactionProcessor) {
        this.transactionProcessor = transactionProcessor;
        this.logger = new common_1.Logger(TransferController_1.name);
    }
    async createTransfer(createTransferDto) {
        this.logger.log(`Creating transfer: ${createTransferDto.amount} ${createTransferDto.currency} from ${createTransferDto.sourceAccountId} to ${createTransferDto.destinationAccountId}`);
        try {
            const result = await this.transactionProcessor.processTransaction({
                type: orm_entities_1.TransactionType.TRANSFER,
                amount: createTransferDto.amount,
                currency: createTransferDto.currency,
                description: createTransferDto.description,
                sourceAccountId: createTransferDto.sourceAccountId,
                destinationAccountId: createTransferDto.destinationAccountId,
                reference: createTransferDto.reference,
                source: orm_entities_1.TransactionSource.INTERNAL,
                initiatedBy: createTransferDto.initiatedBy,
                metadata: createTransferDto.metadata,
            });
            this.logger.log(`Transfer created successfully: ${result.transactionId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Transfer creation failed: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getTransfer(id) {
        const result = await this.transactionProcessor.getTransactionStatus(id);
        if (!result) {
            throw new common_1.NotFoundException('Transfer not found');
        }
        return result;
    }
    async confirmTransfer(id) {
        this.logger.log(`Transfer confirmation requested for: ${id}`);
        return {
            message: 'Transfer confirmation is not required for internal transfers',
            transferId: id,
        };
    }
};
exports.TransferController = TransferController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create transfer',
        description: 'Creates an internal transfer between two accounts',
    }),
    (0, swagger_1.ApiBody)({ type: CreateTransferDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Transfer created successfully',
        type: transaction_dto_1.TransactionResultDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid transfer data',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateTransferDto]),
    __metadata("design:returntype", Promise)
], TransferController.prototype, "createTransfer", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get transfer by ID',
        description: 'Retrieves transfer details by transaction ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Transfer transaction ID',
        type: 'string',
        format: 'uuid',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Transfer retrieved successfully',
        type: transaction_dto_1.TransactionResultDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Transfer not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransferController.prototype, "getTransfer", null);
__decorate([
    (0, common_1.Post)(':id/confirm'),
    (0, swagger_1.ApiOperation)({
        summary: 'Confirm transfer',
        description: 'Confirms a pending transfer (placeholder for future implementation)',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Transfer transaction ID',
        type: 'string',
        format: 'uuid',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Transfer confirmed successfully',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransferController.prototype, "confirmTransfer", null);
exports.TransferController = TransferController = TransferController_1 = __decorate([
    (0, swagger_1.ApiTags)('Transfers'),
    (0, common_1.Controller)('api/v1/transfers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(JwtAuthGuard),
    __metadata("design:paramtypes", [transaction_processor_service_1.TransactionProcessorService])
], TransferController);
//# sourceMappingURL=transfer.controller.js.map