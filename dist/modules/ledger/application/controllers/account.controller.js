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
var AccountController_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const orm_entities_1 = require("../../infrastructure/orm-entities");
const balance_service_1 = require("../domain/services/balance.service");
const blnkfinance_service_1 = require("../../infrastructure/external/blnkfinance.service");
const create_account_dto_1 = require("../dto/requests/create-account.dto");
const update_account_dto_1 = require("../dto/requests/update-account.dto");
const account_dto_1 = require("../dto/responses/account.dto");
class JwtAuthGuard {
}
let AccountController = AccountController_1 = class AccountController {
    constructor(accountRepository, entryRepository, balanceService, blnkFinanceService) {
        this.accountRepository = accountRepository;
        this.entryRepository = entryRepository;
        this.balanceService = balanceService;
        this.blnkFinanceService = blnkFinanceService;
        this.logger = new common_1.Logger(AccountController_1.name);
    }
    async createAccount(createAccountDto) {
        this.logger.log(`Creating account: ${createAccountDto.accountName}`);
        const existingAccount = await this.accountRepository.findOne({
            where: {
                identityAccountId: createAccountDto.identityAccountId,
                currency: createAccountDto.currency,
                isActive: true,
            },
        });
        if (existingAccount) {
            throw new Error('Account already exists for this identity account and currency');
        }
        const account = this.accountRepository.create({
            identityAccountId: createAccountDto.identityAccountId,
            userId: createAccountDto.userId,
            accountName: createAccountDto.accountName,
            accountType: createAccountDto.accountType,
            currency: createAccountDto.currency,
            balance: createAccountDto.initialBalance || 0,
            parentAccountId: createAccountDto.parentAccountId,
            accountLevel: createAccountDto.accountLevel || 1,
            isContra: createAccountDto.isContra || false,
            metadata: createAccountDto.metadata,
        });
        const savedAccount = await this.accountRepository.save(account);
        try {
            await this.blnkFinanceService.syncAccountWithBlnk(savedAccount.id);
        }
        catch (error) {
            this.logger.warn(`Failed to sync account with BlnkFinance: ${error.message}`);
        }
        this.logger.log(`Account created successfully: ${savedAccount.id}`);
        return this.mapToAccountDto(savedAccount);
    }
    async getAccounts(userId, currency, accountType, status, limit = 50, offset = 0) {
        const where = { isActive: true };
        if (userId)
            where.userId = userId;
        if (currency)
            where.currency = currency;
        if (accountType)
            where.accountType = accountType;
        if (status)
            where.status = status;
        const findOptions = {
            where,
            take: Math.min(limit, 100),
            skip: offset,
            order: { createdAt: 'DESC' },
        };
        const [accounts, total] = await this.accountRepository.findAndCount(findOptions);
        return {
            accounts: accounts.map(account => this.mapToAccountDto(account)),
            total,
            limit: findOptions.take,
            offset,
        };
    }
    async getAccount(id) {
        const account = await this.accountRepository.findOne({
            where: { id, isActive: true },
        });
        if (!account) {
            throw new Error('Account not found');
        }
        return this.mapToAccountDto(account);
    }
    async updateAccount(id, updateAccountDto) {
        const account = await this.accountRepository.findOne({
            where: { id, isActive: true },
        });
        if (!account) {
            throw new Error('Account not found');
        }
        Object.assign(account, updateAccountDto);
        account.updatedAt = new Date();
        const updatedAccount = await this.accountRepository.save(account);
        this.logger.log(`Account updated: ${id}`);
        return this.mapToAccountDto(updatedAccount);
    }
    async deleteAccount(id) {
        const account = await this.accountRepository.findOne({
            where: { id, isActive: true },
        });
        if (!account) {
            throw new Error('Account not found');
        }
        const balance = await this.balanceService.getAccountBalance(id);
        if (balance.currentBalance !== 0) {
            throw new Error('Cannot delete account with non-zero balance');
        }
        await this.accountRepository.update(id, {
            isActive: false,
            status: orm_entities_1.AccountStatus.CLOSED,
            deletedAt: new Date(),
        });
        this.logger.log(`Account deleted: ${id}`);
    }
    async getAccountBalance(id) {
        const balance = await this.balanceService.getAccountBalance(id);
        return balance;
    }
    async getAccountStatement(id, startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const end = endDate ? new Date(endDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        const account = await this.accountRepository.findOne({
            where: { id, isActive: true },
        });
        if (!account) {
            throw new Error('Account not found');
        }
        const balanceHistory = await this.balanceService.getBalanceHistory(id, start, end);
        const entries = await this.entryRepository
            .createQueryBuilder('entry')
            .innerJoin('entry.transaction', 'transaction')
            .where('entry.accountId = :accountId', { accountId: id })
            .andWhere('transaction.status = :status', { status: 'COMPLETED' })
            .andWhere('entry.createdAt BETWEEN :start AND :end', { start, end })
            .orderBy('entry.createdAt', 'ASC')
            .getMany();
        const transactions = entries.map(entry => ({
            transactionId: entry.transactionId,
            date: entry.createdAt,
            amount: entry.amount,
            type: entry.entryType.toLowerCase(),
            description: entry.description || 'No description',
            balance: entry.balanceAfter,
        }));
        return {
            accountId: id,
            periodStart: start,
            periodEnd: end,
            openingBalance: balanceHistory.summary.openingBalance,
            closingBalance: balanceHistory.summary.closingBalance,
            totalDebits: balanceHistory.summary.totalDebits,
            totalCredits: balanceHistory.summary.totalCredits,
            transactionCount: balanceHistory.summary.transactionCount,
            currency: account.currency,
            transactions,
        };
    }
    async syncAccount(id) {
        const result = await this.blnkFinanceService.syncAccountWithBlnk(id);
        return {
            status: result.status,
            internalBalance: result.internalBalance,
            externalBalance: result.externalBalance,
            variance: result.variance,
        };
    }
    async recalculateBalance(id) {
        await this.balanceService.recalculateAccountBalance(id);
        return this.balanceService.getAccountBalance(id);
    }
    mapToAccountDto(account) {
        return {
            id: account.id,
            identityAccountId: account.identityAccountId,
            userId: account.userId,
            accountName: account.accountName,
            accountType: account.accountType,
            currency: account.currency,
            balance: account.balance,
            creditBalance: account.creditBalance,
            debitBalance: account.debitBalance,
            blnkAccountId: account.blnkAccountId,
            parentAccountId: account.parentAccountId,
            accountLevel: account.accountLevel,
            isContra: account.isContra,
            normalBalance: account.normalBalance,
            status: account.status,
            isActive: account.isActive,
            metadata: account.metadata,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
            deletedAt: account.deletedAt,
        };
    }
};
exports.AccountController = AccountController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create new ledger account',
        description: 'Creates a new ledger account linked to an identity service account',
    }),
    (0, swagger_1.ApiBody)({ type: create_account_dto_1.CreateAccountDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Account created successfully',
        type: account_dto_1.AccountDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid account data',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CONFLICT,
        description: 'Account already exists',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_account_dto_1.CreateAccountDto]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "createAccount", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get accounts',
        description: 'Retrieves a list of accounts with optional filtering',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'userId',
        required: false,
        description: 'Filter by user ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'currency',
        required: false,
        description: 'Filter by currency',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'accountType',
        required: false,
        enum: orm_entities_1.AccountType,
        description: 'Filter by account type',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: orm_entities_1.AccountStatus,
        description: 'Filter by account status',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of accounts to return (max 100)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'offset',
        required: false,
        type: Number,
        description: 'Number of accounts to skip',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Accounts retrieved successfully',
        type: [account_dto_1.AccountDto],
    }),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('currency')),
    __param(2, (0, common_1.Query)('accountType')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_a = typeof orm_entities_1.AccountType !== "undefined" && orm_entities_1.AccountType) === "function" ? _a : Object, typeof (_b = typeof orm_entities_1.AccountStatus !== "undefined" && orm_entities_1.AccountStatus) === "function" ? _b : Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "getAccounts", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get account by ID',
        description: 'Retrieves a specific account by its ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Account ID',
        type: 'string',
        format: 'uuid',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Account retrieved successfully',
        type: account_dto_1.AccountDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Account not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "getAccount", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update account',
        description: 'Updates an existing account',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Account ID',
        type: 'string',
        format: 'uuid',
    }),
    (0, swagger_1.ApiBody)({ type: update_account_dto_1.UpdateAccountDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Account updated successfully',
        type: account_dto_1.AccountDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Account not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_account_dto_1.UpdateAccountDto]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "updateAccount", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete account',
        description: 'Soft deletes an account (sets isActive to false)',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Account ID',
        type: 'string',
        format: 'uuid',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NO_CONTENT,
        description: 'Account deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Account not found',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "deleteAccount", null);
__decorate([
    (0, common_1.Get)(':id/balance'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get account balance',
        description: 'Retrieves real-time balance information for an account',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Account ID',
        type: 'string',
        format: 'uuid',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Balance retrieved successfully',
        type: account_dto_1.AccountBalanceDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Account not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "getAccountBalance", null);
__decorate([
    (0, common_1.Get)(':id/statement'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get account statement',
        description: 'Retrieves account statement for a specified period',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Account ID',
        type: 'string',
        format: 'uuid',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        required: false,
        description: 'Statement start date (ISO 8601)',
        example: '2024-01-01',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'endDate',
        required: false,
        description: 'Statement end date (ISO 8601)',
        example: '2024-01-31',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Statement retrieved successfully',
        type: account_dto_1.AccountStatementDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Account not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "getAccountStatement", null);
__decorate([
    (0, common_1.Post)(':id/sync'),
    (0, swagger_1.ApiOperation)({
        summary: 'Sync account with BlnkFinance',
        description: 'Manually triggers synchronization with external BlnkFinance service',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Account ID',
        type: 'string',
        format: 'uuid',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Account synchronized successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Account not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "syncAccount", null);
__decorate([
    (0, common_1.Post)(':id/recalculate-balance'),
    (0, swagger_1.ApiOperation)({
        summary: 'Recalculate account balance',
        description: 'Recalculates account balance from transaction entries',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Account ID',
        type: 'string',
        format: 'uuid',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Balance recalculated successfully',
        type: account_dto_1.AccountBalanceDto,
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "recalculateBalance", null);
exports.AccountController = AccountController = AccountController_1 = __decorate([
    (0, swagger_1.ApiTags)('Accounts'),
    (0, common_1.Controller)('api/v1/accounts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(JwtAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(orm_entities_1.LedgerAccountOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(orm_entities_1.TransactionEntryOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        balance_service_1.BalanceService,
        blnkfinance_service_1.BlnkFinanceService])
], AccountController);
//# sourceMappingURL=account.controller.js.map