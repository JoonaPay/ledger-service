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
var TransactionController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const orm_entities_1 = require("../../infrastructure/orm-entities");
const transaction_processor_service_1 = require("../domain/services/transaction-processor.service");
const process_transaction_dto_1 = require("../dto/requests/process-transaction.dto");
const transaction_dto_1 = require("../dto/responses/transaction.dto");
class JwtAuthGuard {
}
let TransactionController = TransactionController_1 = class TransactionController {
    constructor(transactionRepository, transactionProcessor) {
        this.transactionRepository = transactionRepository;
        this.transactionProcessor = transactionProcessor;
        this.logger = new common_1.Logger(TransactionController_1.name);
    }
    async processTransaction(processTransactionDto) {
        this.logger.log(`Processing transaction: ${processTransactionDto.type} - ${processTransactionDto.amount} ${processTransactionDto.currency}`);
        try {
            const result = await this.transactionProcessor.processTransaction(processTransactionDto);
            this.logger.log(`Transaction processed successfully: ${result.transactionId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Transaction processing failed: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(error.message);
        }
    }
    async searchTransactions(accountId, type, status, source, currency, reference, minAmount, maxAmount, startDate, endDate, limit = 20, offset = 0) {
        const where = {};
        if (accountId) {
            where.accountId = accountId;
        }
        if (type) {
            where.transactionType = type;
        }
        if (status) {
            where.status = status;
        }
        if (source) {
            where.source = source;
        }
        if (currency) {
            where.currency = currency;
        }
        if (reference) {
            where.transactionReference = (0, typeorm_2.Like)(`%${reference}%`);
        }
        if (minAmount !== undefined || maxAmount !== undefined) {
            where.amount = {};
            if (minAmount !== undefined)
                where.amount.gte = minAmount;
            if (maxAmount !== undefined)
                where.amount.lte = maxAmount;
        }
        if (startDate || endDate) {
            const start = startDate ? new Date(startDate) : new Date('1970-01-01');
            const end = endDate ? new Date(endDate) : new Date();
            where.createdAt = (0, typeorm_2.Between)(start, end);
        }
        const findOptions = {
            where,
            take: Math.min(limit, 100),
            skip: offset,
            order: { createdAt: 'DESC' },
            relations: ['entries'],
        };
        const [transactions, total] = await this.transactionRepository.findAndCount(findOptions);
        return {
            transactions: transactions.map(transaction => this.mapToTransactionDto(transaction)),
            total,
            limit: findOptions.take,
            offset,
        };
    }
    async getTransaction(id) {
        const transaction = await this.transactionRepository.findOne({
            where: { id },
            relations: ['entries', 'account', 'counterpartyAccount'],
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return this.mapToTransactionDto(transaction);
    }
    async getTransactionStatus(id) {
        const result = await this.transactionProcessor.getTransactionStatus(id);
        if (!result) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return result;
    }
    async reverseTransaction(id, reverseTransactionDto) {
        this.logger.log(`Reversing transaction: ${id} - Reason: ${reverseTransactionDto.reason}`);
        try {
            const result = await this.transactionProcessor.reverseTransaction(id, reverseTransactionDto.reason, reverseTransactionDto.initiatedBy);
            this.logger.log(`Transaction reversed successfully: ${result.transactionId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Transaction reversal failed: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getTransactionByReference(reference) {
        const transaction = await this.transactionRepository.findOne({
            where: { transactionReference: reference },
            relations: ['entries', 'account', 'counterpartyAccount'],
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return this.mapToTransactionDto(transaction);
    }
    async getAccountTransactions(accountId, limit = 20, offset = 0, status) {
        const where = {
            $or: [
                { accountId },
                { counterpartyAccountId: accountId }
            ]
        };
        if (status) {
            where.status = status;
        }
        const findOptions = {
            where,
            take: Math.min(limit, 100),
            skip: offset,
            order: { createdAt: 'DESC' },
            relations: ['entries'],
        };
        const [transactions, total] = await this.transactionRepository.findAndCount(findOptions);
        return {
            transactions: transactions.map(transaction => this.mapToTransactionDto(transaction)),
            total,
            limit: findOptions.take,
            offset,
        };
    }
    async getPendingTransactionsCount() {
        const pendingTransactions = await this.transactionRepository.find({
            where: {
                status: { $in: [orm_entities_1.TransactionStatus.PENDING, orm_entities_1.TransactionStatus.PROCESSING] }
            },
        });
        const currencies = {};
        let totalAmount = 0;
        for (const transaction of pendingTransactions) {
            currencies[transaction.currency] = (currencies[transaction.currency] || 0) + transaction.amount;
            totalAmount += transaction.amount;
        }
        return {
            count: pendingTransactions.length,
            totalAmount,
            currencies,
        };
    }
    async getRecentFailedTransactions(limit = 10) {
        const transactions = await this.transactionRepository.find({
            where: { status: orm_entities_1.TransactionStatus.FAILED },
            take: Math.min(limit, 50),
            order: { createdAt: 'DESC' },
            relations: ['entries'],
        });
        return transactions.map(transaction => this.mapToTransactionDto(transaction));
    }
    mapToTransactionDto(transaction) {
        const entries = transaction.entries?.map(entry => ({
            accountId: entry.accountId,
            amount: entry.amount,
            type: entry.entryType.toLowerCase(),
            balanceBefore: entry.balanceBefore,
            balanceAfter: entry.balanceAfter,
            description: entry.description,
        })) || [];
        return {
            id: transaction.id,
            transactionReference: transaction.transactionReference,
            transactionType: transaction.transactionType,
            amount: transaction.amount,
            currency: transaction.currency,
            description: transaction.description,
            accountId: transaction.accountId,
            counterpartyAccountId: transaction.counterpartyAccountId,
            counterpartyName: transaction.counterpartyName,
            blnkTransactionId: transaction.blnkTransactionId,
            externalReference: transaction.externalReference,
            source: transaction.source,
            status: transaction.status,
            balanceBefore: transaction.balanceBefore,
            balanceAfter: transaction.balanceAfter,
            feeAmount: transaction.feeAmount,
            exchangeRate: transaction.exchangeRate,
            settlementDate: transaction.settlementDate,
            valueDate: transaction.valueDate,
            riskScore: transaction.riskScore,
            complianceStatus: transaction.complianceStatus,
            metadata: transaction.metadata,
            processedAt: transaction.processedAt,
            failedReason: transaction.failedReason,
            reversalTransactionId: transaction.reversalTransactionId,
            isReversal: transaction.isReversal,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
            entries,
        };
    }
};
exports.TransactionController = TransactionController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Process transaction',
        description: 'Processes a financial transaction with double-entry bookkeeping',
    }),
    (0, swagger_1.ApiBody)({ type: process_transaction_dto_1.ProcessTransactionDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Transaction processed successfully',
        type: transaction_dto_1.TransactionResultDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid transaction data',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
        description: 'Transaction validation failed',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [process_transaction_dto_1.ProcessTransactionDto]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "processTransaction", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Search transactions',
        description: 'Retrieves transactions with optional filtering and pagination',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'accountId',
        required: false,
        description: 'Filter by account ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        required: false,
        enum: orm_entities_1.TransactionType,
        description: 'Filter by transaction type',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: orm_entities_1.TransactionStatus,
        description: 'Filter by transaction status',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'source',
        required: false,
        enum: orm_entities_1.TransactionSource,
        description: 'Filter by transaction source',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'currency',
        required: false,
        description: 'Filter by currency',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'reference',
        required: false,
        description: 'Filter by transaction reference (partial match)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'minAmount',
        required: false,
        type: Number,
        description: 'Minimum transaction amount',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'maxAmount',
        required: false,
        type: Number,
        description: 'Maximum transaction amount',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        required: false,
        description: 'Start date for date range filter (ISO 8601)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'endDate',
        required: false,
        description: 'End date for date range filter (ISO 8601)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of transactions to return (max 100)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'offset',
        required: false,
        type: Number,
        description: 'Number of transactions to skip',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Transactions retrieved successfully',
        type: transaction_dto_1.TransactionSearchResultDto,
    }),
    __param(0, (0, common_1.Query)('accountId')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('source')),
    __param(4, (0, common_1.Query)('currency')),
    __param(5, (0, common_1.Query)('reference')),
    __param(6, (0, common_1.Query)('minAmount')),
    __param(7, (0, common_1.Query)('maxAmount')),
    __param(8, (0, common_1.Query)('startDate')),
    __param(9, (0, common_1.Query)('endDate')),
    __param(10, (0, common_1.Query)('limit')),
    __param(11, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Number, Number, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "searchTransactions", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get transaction by ID',
        description: 'Retrieves a specific transaction by its ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Transaction ID',
        type: 'string',
        format: 'uuid',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Transaction retrieved successfully',
        type: transaction_dto_1.TransactionDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Transaction not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get transaction status',
        description: 'Retrieves the current status and processing details of a transaction',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Transaction ID',
        type: 'string',
        format: 'uuid',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Transaction status retrieved successfully',
        type: transaction_dto_1.TransactionResultDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Transaction not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getTransactionStatus", null);
__decorate([
    (0, common_1.Post)(':id/reverse'),
    (0, swagger_1.ApiOperation)({
        summary: 'Reverse transaction',
        description: 'Creates a reversal transaction for a completed transaction',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Original transaction ID to reverse',
        type: 'string',
        format: 'uuid',
    }),
    (0, swagger_1.ApiBody)({ type: process_transaction_dto_1.ReverseTransactionDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Transaction reversed successfully',
        type: transaction_dto_1.TransactionResultDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Transaction cannot be reversed',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Original transaction not found',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, process_transaction_dto_1.ReverseTransactionDto]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "reverseTransaction", null);
__decorate([
    (0, common_1.Get)('reference/:reference'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get transaction by reference',
        description: 'Retrieves a transaction by its reference number',
    }),
    (0, swagger_1.ApiParam)({
        name: 'reference',
        description: 'Transaction reference',
        type: 'string',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Transaction retrieved successfully',
        type: transaction_dto_1.TransactionDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Transaction not found',
    }),
    __param(0, (0, common_1.Param)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getTransactionByReference", null);
__decorate([
    (0, common_1.Get)('account/:accountId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get account transactions',
        description: 'Retrieves all transactions for a specific account',
    }),
    (0, swagger_1.ApiParam)({
        name: 'accountId',
        description: 'Account ID',
        type: 'string',
        format: 'uuid',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of transactions to return (max 100)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'offset',
        required: false,
        type: Number,
        description: 'Number of transactions to skip',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: orm_entities_1.TransactionStatus,
        description: 'Filter by transaction status',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Account transactions retrieved successfully',
        type: transaction_dto_1.TransactionSearchResultDto,
    }),
    __param(0, (0, common_1.Param)('accountId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getAccountTransactions", null);
__decorate([
    (0, common_1.Get)('pending/count'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get pending transactions count',
        description: 'Returns the number of pending transactions',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Pending transactions count retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                count: { type: 'number' },
                totalAmount: { type: 'number' },
                currencies: {
                    type: 'object',
                    additionalProperties: { type: 'number' }
                }
            }
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getPendingTransactionsCount", null);
__decorate([
    (0, common_1.Get)('failed/recent'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get recent failed transactions',
        description: 'Returns recently failed transactions for monitoring',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of transactions to return (max 50)',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Recent failed transactions retrieved successfully',
        type: [transaction_dto_1.TransactionDto],
    }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getRecentFailedTransactions", null);
exports.TransactionController = TransactionController = TransactionController_1 = __decorate([
    (0, swagger_1.ApiTags)('Transactions'),
    (0, common_1.Controller)('api/v1/transactions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(JwtAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(orm_entities_1.TransactionOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        transaction_processor_service_1.TransactionProcessorService])
], TransactionController);
//# sourceMappingURL=transaction.controller.js.map