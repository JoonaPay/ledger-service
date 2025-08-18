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
var TransactionProcessorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionProcessorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const config_1 = require("@nestjs/config");
const orm_entities_1 = require("../../../infrastructure/orm-entities");
const double_entry_service_1 = require("./double-entry.service");
const balance_service_1 = require("./balance.service");
const blnkfinance_service_1 = require("../../../infrastructure/external/blnkfinance.service");
let TransactionProcessorService = TransactionProcessorService_1 = class TransactionProcessorService {
    constructor(accountRepository, transactionRepository, entryRepository, doubleEntryService, balanceService, blnkFinanceService, eventEmitter, configService, dataSource) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.entryRepository = entryRepository;
        this.doubleEntryService = doubleEntryService;
        this.balanceService = balanceService;
        this.blnkFinanceService = blnkFinanceService;
        this.eventEmitter = eventEmitter;
        this.configService = configService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(TransactionProcessorService_1.name);
    }
    async processTransaction(request) {
        const transactionId = this.generateTransactionId();
        const reference = request.reference || this.generateTransactionReference();
        this.logger.log(`Processing transaction ${transactionId}: ${request.type} - ${request.amount} ${request.currency}`);
        try {
            const validation = await this.validateTransaction(request);
            if (!validation.isValid) {
                throw new Error(`Transaction validation failed: ${validation.errors.join(', ')}`);
            }
            const transaction = await this.createTransactionRecord(transactionId, reference, request);
            let result;
            switch (request.type) {
                case orm_entities_1.TransactionType.DEPOSIT:
                    result = await this.processDeposit(transaction, request);
                    break;
                case orm_entities_1.TransactionType.WITHDRAWAL:
                    result = await this.processWithdrawal(transaction, request);
                    break;
                case orm_entities_1.TransactionType.TRANSFER:
                    result = await this.processTransfer(transaction, request);
                    break;
                case orm_entities_1.TransactionType.FEE:
                    result = await this.processFee(transaction, request);
                    break;
                case orm_entities_1.TransactionType.ADJUSTMENT:
                    result = await this.processAdjustment(transaction, request);
                    break;
                default:
                    throw new Error(`Unsupported transaction type: ${request.type}`);
            }
            if (this.isBlnkSyncEnabled() && result.status === orm_entities_1.TransactionStatus.COMPLETED) {
                await this.syncWithBlnkFinance(result, request);
            }
            await this.emitTransactionEvents(result);
            this.logger.log(`Transaction ${transactionId} processed successfully with status: ${result.status}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Transaction ${transactionId} failed: ${error.message}`, error.stack);
            await this.updateTransactionStatus(transactionId, orm_entities_1.TransactionStatus.FAILED, error.message);
            this.eventEmitter.emit('transaction.failed', {
                transactionId,
                reference,
                error: error.message,
                request,
            });
            throw error;
        }
    }
    async reverseTransaction(originalTransactionId, reason, initiatedBy) {
        const originalTransaction = await this.transactionRepository.findOne({
            where: { id: originalTransactionId },
            relations: ['entries'],
        });
        if (!originalTransaction) {
            throw new Error(`Original transaction ${originalTransactionId} not found`);
        }
        if (originalTransaction.status !== orm_entities_1.TransactionStatus.COMPLETED) {
            throw new Error(`Cannot reverse transaction with status: ${originalTransaction.status}`);
        }
        if (originalTransaction.isReversal) {
            throw new Error('Cannot reverse a reversal transaction');
        }
        const reversalId = this.generateTransactionId();
        const reversalReference = this.generateReversalReference(originalTransaction.transactionReference);
        this.logger.log(`Reversing transaction ${originalTransactionId} with reversal ${reversalId}`);
        try {
            const reversalEntries = originalTransaction.entries.map(entry => ({
                accountId: entry.accountId,
                amount: entry.amount,
                type: entry.entryType === 'DEBIT' ? 'credit' : 'debit',
                description: `Reversal: ${entry.description || reason}`,
            }));
            const doubleEntryTxn = {
                transactionId: reversalId,
                reference: reversalReference,
                description: `Reversal of ${originalTransaction.transactionReference}: ${reason}`,
                entries: reversalEntries,
                metadata: {
                    isReversal: true,
                    originalTransactionId: originalTransactionId,
                    originalReference: originalTransaction.transactionReference,
                    reversalReason: reason,
                    initiatedBy,
                },
            };
            await this.doubleEntryService.processDoubleEntryTransaction(doubleEntryTxn);
            await this.transactionRepository.update(originalTransactionId, {
                status: orm_entities_1.TransactionStatus.REVERSED,
                reversalTransactionId: reversalId,
                metadata: () => `jsonb_set(metadata, '{}', '${JSON.stringify({
                    ...originalTransaction.metadata,
                    reversedAt: new Date().toISOString(),
                    reversalReason: reason,
                    reversedBy: initiatedBy,
                })}'::jsonb)`,
            });
            const reversalTransaction = await this.transactionRepository.findOne({
                where: { id: reversalId },
                relations: ['entries'],
            });
            const result = {
                transactionId: reversalId,
                reference: reversalReference,
                status: orm_entities_1.TransactionStatus.COMPLETED,
                amount: originalTransaction.amount,
                currency: originalTransaction.currency,
                sourceAccountId: originalTransaction.counterpartyAccountId,
                destinationAccountId: originalTransaction.accountId,
                entries: reversalTransaction.entries.map(entry => ({
                    accountId: entry.accountId,
                    amount: entry.amount,
                    type: entry.entryType.toLowerCase(),
                    balanceBefore: entry.balanceBefore,
                    balanceAfter: entry.balanceAfter,
                })),
                metadata: doubleEntryTxn.metadata,
                processedAt: new Date(),
            };
            this.eventEmitter.emit('transaction.reversed', {
                originalTransactionId,
                reversalTransactionId: reversalId,
                reason,
                initiatedBy,
            });
            this.logger.log(`Transaction ${originalTransactionId} reversed successfully`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to reverse transaction ${originalTransactionId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getTransactionStatus(transactionId) {
        const transaction = await this.transactionRepository.findOne({
            where: { id: transactionId },
            relations: ['entries', 'account', 'counterpartyAccount'],
        });
        if (!transaction) {
            return null;
        }
        return {
            transactionId: transaction.id,
            reference: transaction.transactionReference,
            status: transaction.status,
            amount: transaction.amount,
            currency: transaction.currency,
            sourceAccountId: transaction.accountId,
            destinationAccountId: transaction.counterpartyAccountId,
            entries: transaction.entries.map(entry => ({
                accountId: entry.accountId,
                amount: entry.amount,
                type: entry.entryType.toLowerCase(),
                balanceBefore: entry.balanceBefore,
                balanceAfter: entry.balanceAfter,
            })),
            metadata: transaction.metadata,
            processedAt: transaction.processedAt,
            failedReason: transaction.failedReason,
        };
    }
    async validateTransaction(request) {
        const errors = [];
        const warnings = [];
        if (!request.amount || request.amount <= 0) {
            errors.push('Amount must be positive');
        }
        if (!request.currency || request.currency.length !== 3) {
            errors.push('Invalid currency code');
        }
        if (!request.description || request.description.trim().length === 0) {
            errors.push('Description is required');
        }
        switch (request.type) {
            case orm_entities_1.TransactionType.TRANSFER:
                if (!request.sourceAccountId || !request.destinationAccountId) {
                    errors.push('Transfer requires both source and destination accounts');
                }
                if (request.sourceAccountId === request.destinationAccountId) {
                    errors.push('Source and destination accounts cannot be the same');
                }
                break;
            case orm_entities_1.TransactionType.DEPOSIT:
                if (!request.destinationAccountId) {
                    errors.push('Deposit requires a destination account');
                }
                break;
            case orm_entities_1.TransactionType.WITHDRAWAL:
                if (!request.sourceAccountId) {
                    errors.push('Withdrawal requires a source account');
                }
                break;
        }
        const accountIds = [request.sourceAccountId, request.destinationAccountId].filter(Boolean);
        if (accountIds.length > 0) {
            const accounts = await this.accountRepository.findBy({ id: { $in: accountIds } });
            for (const accountId of accountIds) {
                const account = accounts.find(acc => acc.id === accountId);
                if (!account) {
                    errors.push(`Account ${accountId} not found`);
                }
                else if (!account.isActive) {
                    errors.push(`Account ${accountId} is not active`);
                }
                else if (account.currency !== request.currency) {
                    warnings.push(`Account ${accountId} currency (${account.currency}) differs from transaction currency (${request.currency})`);
                }
            }
        }
        const maxTransactionAmount = this.configService.get('ledger.maxTransactionAmount', 1000000);
        if (request.amount > maxTransactionAmount) {
            errors.push(`Transaction amount exceeds maximum limit of ${maxTransactionAmount}`);
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
    async processDeposit(transaction, request) {
        return this.executeDoubleEntryTransaction(transaction.id, transaction.transactionReference, await this.doubleEntryService.createDeposit(request.destinationAccountId, request.amount, request.description, undefined, transaction.transactionReference, request.metadata));
    }
    async processWithdrawal(transaction, request) {
        return this.executeDoubleEntryTransaction(transaction.id, transaction.transactionReference, await this.doubleEntryService.createWithdrawal(request.sourceAccountId, request.amount, request.description, undefined, transaction.transactionReference, request.metadata));
    }
    async processTransfer(transaction, request) {
        return this.executeDoubleEntryTransaction(transaction.id, transaction.transactionReference, await this.doubleEntryService.createTransfer(request.sourceAccountId, request.destinationAccountId, request.amount, request.description, transaction.transactionReference, request.metadata));
    }
    async processFee(transaction, request) {
        const feeCollectionAccount = await this.getFeeCollectionAccount(request.currency);
        return this.executeDoubleEntryTransaction(transaction.id, transaction.transactionReference, await this.doubleEntryService.createTransfer(request.sourceAccountId, feeCollectionAccount, request.amount, `Fee: ${request.description}`, transaction.transactionReference, request.metadata));
    }
    async processAdjustment(transaction, request) {
        const adjustmentAccount = await this.getAdjustmentAccount(request.currency);
        return this.executeDoubleEntryTransaction(transaction.id, transaction.transactionReference, await this.doubleEntryService.createTransfer(adjustmentAccount, request.destinationAccountId || request.sourceAccountId, request.amount, `Adjustment: ${request.description}`, transaction.transactionReference, request.metadata));
    }
    async createTransactionRecord(transactionId, reference, request) {
        const transaction = this.transactionRepository.create({
            id: transactionId,
            transactionReference: reference,
            transactionType: request.type,
            amount: request.amount,
            currency: request.currency,
            description: request.description,
            accountId: request.sourceAccountId || request.destinationAccountId,
            counterpartyAccountId: request.destinationAccountId || request.sourceAccountId,
            externalReference: request.externalReference,
            source: request.source || orm_entities_1.TransactionSource.INTERNAL,
            status: orm_entities_1.TransactionStatus.PENDING,
            balanceBefore: 0,
            balanceAfter: 0,
            metadata: {
                ...request.metadata,
                initiatedBy: request.initiatedBy,
                processedBy: 'LEDGER_SERVICE',
            },
        });
        return this.transactionRepository.save(transaction);
    }
    async executeDoubleEntryTransaction(transactionId, reference, doubleEntryTxnId) {
        const transaction = await this.transactionRepository.findOne({
            where: { id: transactionId },
            relations: ['entries'],
        });
        if (!transaction) {
            throw new Error(`Transaction ${transactionId} not found after processing`);
        }
        return {
            transactionId,
            reference,
            status: transaction.status,
            amount: transaction.amount,
            currency: transaction.currency,
            sourceAccountId: transaction.accountId,
            destinationAccountId: transaction.counterpartyAccountId,
            entries: transaction.entries.map(entry => ({
                accountId: entry.accountId,
                amount: entry.amount,
                type: entry.entryType.toLowerCase(),
                balanceBefore: entry.balanceBefore,
                balanceAfter: entry.balanceAfter,
            })),
            metadata: transaction.metadata,
            processedAt: transaction.processedAt,
        };
    }
    async updateTransactionStatus(transactionId, status, failedReason) {
        const updates = {
            status,
            updatedAt: new Date(),
        };
        if (status === orm_entities_1.TransactionStatus.COMPLETED) {
            updates.processedAt = new Date();
        }
        else if (status === orm_entities_1.TransactionStatus.FAILED && failedReason) {
            updates.failedReason = failedReason;
        }
        await this.transactionRepository.update(transactionId, updates);
    }
    async syncWithBlnkFinance(result, request) {
        try {
            if (request.type === orm_entities_1.TransactionType.TRANSFER && result.sourceAccountId && result.destinationAccountId) {
                await this.blnkFinanceService.postTransactionToBlnk(result.sourceAccountId, result.destinationAccountId, result.amount, result.currency, result.reference, request.description, result.metadata);
            }
        }
        catch (error) {
            this.logger.error(`Failed to sync transaction ${result.transactionId} with BlnkFinance: ${error.message}`);
        }
    }
    async emitTransactionEvents(result) {
        this.eventEmitter.emit('transaction.processed', result);
        if (result.status === orm_entities_1.TransactionStatus.COMPLETED) {
            this.eventEmitter.emit('transaction.completed', result);
        }
        else if (result.status === orm_entities_1.TransactionStatus.FAILED) {
            this.eventEmitter.emit('transaction.failed', result);
        }
    }
    async getFeeCollectionAccount(currency) {
        const account = await this.accountRepository.findOne({
            where: {
                accountName: `FEE_COLLECTION_${currency}`,
                currency,
                isActive: true,
            },
        });
        if (!account) {
            throw new Error(`Fee collection account not found for currency: ${currency}`);
        }
        return account.id;
    }
    async getAdjustmentAccount(currency) {
        const account = await this.accountRepository.findOne({
            where: {
                accountName: `ADJUSTMENT_${currency}`,
                currency,
                isActive: true,
            },
        });
        if (!account) {
            throw new Error(`Adjustment account not found for currency: ${currency}`);
        }
        return account.id;
    }
    isBlnkSyncEnabled() {
        return this.configService.get('blnkfinance.syncEnabled', true);
    }
    generateTransactionId() {
        return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateTransactionReference() {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        return `TXN${date}${random}`;
    }
    generateReversalReference(originalReference) {
        return `REV_${originalReference}_${Date.now()}`;
    }
};
exports.TransactionProcessorService = TransactionProcessorService;
exports.TransactionProcessorService = TransactionProcessorService = TransactionProcessorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(orm_entities_1.LedgerAccountOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(orm_entities_1.TransactionOrmEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(orm_entities_1.TransactionEntryOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        double_entry_service_1.DoubleEntryService,
        balance_service_1.BalanceService,
        blnkfinance_service_1.BlnkFinanceService,
        event_emitter_1.EventEmitter2,
        config_1.ConfigService,
        typeorm_2.DataSource])
], TransactionProcessorService);
//# sourceMappingURL=transaction-processor.service.js.map