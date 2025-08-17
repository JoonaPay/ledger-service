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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoubleEntryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const decimal_js_1 = require("decimal.js");
const orm_entities_1 = require("../../../infrastructure/orm-entities");
let DoubleEntryService = class DoubleEntryService {
    constructor(accountRepository, transactionRepository, entryRepository, dataSource) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.entryRepository = entryRepository;
        this.dataSource = dataSource;
    }
    async validateDoubleEntryTransaction(transaction) {
        const errors = [];
        const totalDebits = transaction.entries
            .filter(entry => entry.type === 'debit')
            .reduce((sum, entry) => new decimal_js_1.Decimal(sum).plus(entry.amount).toNumber(), 0);
        const totalCredits = transaction.entries
            .filter(entry => entry.type === 'credit')
            .reduce((sum, entry) => new decimal_js_1.Decimal(sum).plus(entry.amount).toNumber(), 0);
        const balanceDifference = new decimal_js_1.Decimal(totalDebits).minus(totalCredits).toNumber();
        if (transaction.entries.length < 2) {
            errors.push('Transaction must have at least 2 entries for double-entry bookkeeping');
        }
        if (Math.abs(balanceDifference) > 0.01) {
            errors.push(`Transaction is unbalanced: debits=${totalDebits}, credits=${totalCredits}, difference=${balanceDifference}`);
        }
        for (const entry of transaction.entries) {
            if (entry.amount <= 0) {
                errors.push(`Entry for account ${entry.accountId} has invalid amount: ${entry.amount}`);
            }
        }
        const accountIds = transaction.entries.map(entry => entry.accountId);
        const accounts = await this.accountRepository.findBy({ id: { $in: accountIds } });
        for (const accountId of accountIds) {
            const account = accounts.find(acc => acc.id === accountId);
            if (!account) {
                errors.push(`Account ${accountId} not found`);
            }
            else if (!account.isActive) {
                errors.push(`Account ${accountId} is not active`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            totalDebits,
            totalCredits,
            balanceDifference,
        };
    }
    async processDoubleEntryTransaction(transaction) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const validation = await this.validateDoubleEntryTransaction(transaction);
            if (!validation.isValid) {
                throw new Error(`Transaction validation failed: ${validation.errors.join(', ')}`);
            }
            const accountIds = transaction.entries.map(entry => entry.accountId);
            const accounts = await queryRunner.manager
                .createQueryBuilder(orm_entities_1.LedgerAccountOrmEntity, 'account')
                .setLock('pessimistic_write')
                .whereInIds(accountIds)
                .getMany();
            for (const entry of transaction.entries) {
                const account = accounts.find(acc => acc.id === entry.accountId);
                if (!account) {
                    throw new Error(`Account ${entry.accountId} not found`);
                }
                if (entry.type === 'debit' && !this.canDebitAccount(account, entry.amount)) {
                    throw new Error(`Insufficient funds in account ${entry.accountId}`);
                }
            }
            const transactionEntity = queryRunner.manager.create(orm_entities_1.TransactionOrmEntity, {
                id: transaction.transactionId,
                transactionReference: transaction.reference,
                transactionType: 'TRANSFER',
                amount: validation.totalDebits,
                currency: accounts[0]?.currency || 'USD',
                description: transaction.description,
                accountId: transaction.entries[0]?.accountId,
                status: orm_entities_1.TransactionStatus.PROCESSING,
                balanceBefore: 0,
                balanceAfter: 0,
                metadata: transaction.metadata,
            });
            await queryRunner.manager.save(transactionEntity);
            const entries = [];
            for (let i = 0; i < transaction.entries.length; i++) {
                const entry = transaction.entries[i];
                const account = accounts.find(acc => acc.id === entry.accountId);
                const balanceBefore = this.calculateAccountBalance(account);
                const balanceAfter = this.applyEntryToBalance(account, entry);
                const entryEntity = queryRunner.manager.create(orm_entities_1.TransactionEntryOrmEntity, {
                    transactionId: transaction.transactionId,
                    accountId: entry.accountId,
                    entryType: entry.type.toUpperCase(),
                    amount: entry.amount,
                    currency: account.currency,
                    description: entry.description || transaction.description,
                    balanceBefore,
                    balanceAfter,
                    entrySequence: entry.sequence || i + 1,
                    metadata: {
                        originalTransactionId: transaction.transactionId,
                        entryIndex: i
                    },
                });
                await queryRunner.manager.save(entryEntity);
                entries.push(entryEntity);
                await this.updateAccountBalance(queryRunner, account, entry);
            }
            await queryRunner.manager.update(orm_entities_1.TransactionOrmEntity, transaction.transactionId, {
                status: orm_entities_1.TransactionStatus.COMPLETED,
                processedAt: new Date(),
            });
            await queryRunner.commitTransaction();
            return transaction.transactionId;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            try {
                await this.transactionRepository.update(transaction.transactionId, {
                    status: orm_entities_1.TransactionStatus.FAILED,
                    failedReason: error.message,
                });
            }
            catch (updateError) {
                console.error('Failed to update transaction status:', updateError);
            }
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async createTransfer(fromAccountId, toAccountId, amount, description, reference, metadata) {
        const transactionId = this.generateTransactionId();
        const transactionReference = reference || this.generateTransactionReference();
        const doubleEntryTransaction = {
            transactionId,
            reference: transactionReference,
            description,
            entries: [
                {
                    accountId: fromAccountId,
                    amount,
                    type: 'credit',
                    description: `Transfer to ${toAccountId}`,
                    sequence: 1,
                },
                {
                    accountId: toAccountId,
                    amount,
                    type: 'debit',
                    description: `Transfer from ${fromAccountId}`,
                    sequence: 2,
                },
            ],
            metadata,
        };
        return this.processDoubleEntryTransaction(doubleEntryTransaction);
    }
    async createDeposit(accountId, amount, description, systemAccountId, reference, metadata) {
        const transactionId = this.generateTransactionId();
        const transactionReference = reference || this.generateTransactionReference();
        const defaultSystemAccount = systemAccountId || await this.getSystemCashAccount();
        const doubleEntryTransaction = {
            transactionId,
            reference: transactionReference,
            description,
            entries: [
                {
                    accountId: accountId,
                    amount,
                    type: 'debit',
                    description: `Deposit: ${description}`,
                    sequence: 1,
                },
                {
                    accountId: defaultSystemAccount,
                    amount,
                    type: 'credit',
                    description: `Deposit source: ${description}`,
                    sequence: 2,
                },
            ],
            metadata,
        };
        return this.processDoubleEntryTransaction(doubleEntryTransaction);
    }
    async createWithdrawal(accountId, amount, description, systemAccountId, reference, metadata) {
        const transactionId = this.generateTransactionId();
        const transactionReference = reference || this.generateTransactionReference();
        const defaultSystemAccount = systemAccountId || await this.getSystemCashAccount();
        const doubleEntryTransaction = {
            transactionId,
            reference: transactionReference,
            description,
            entries: [
                {
                    accountId: accountId,
                    amount,
                    type: 'credit',
                    description: `Withdrawal: ${description}`,
                    sequence: 1,
                },
                {
                    accountId: defaultSystemAccount,
                    amount,
                    type: 'debit',
                    description: `Withdrawal destination: ${description}`,
                    sequence: 2,
                },
            ],
            metadata,
        };
        return this.processDoubleEntryTransaction(doubleEntryTransaction);
    }
    canDebitAccount(account, amount) {
        return true;
    }
    calculateAccountBalance(account) {
        return account.balance;
    }
    applyEntryToBalance(account, entry) {
        const currentBalance = new decimal_js_1.Decimal(account.balance);
        const entryAmount = new decimal_js_1.Decimal(entry.amount);
        if (entry.type === 'debit') {
            if (account.accountType === orm_entities_1.AccountType.ASSET || account.accountType === orm_entities_1.AccountType.EXPENSE) {
                return currentBalance.plus(entryAmount).toNumber();
            }
            else {
                return currentBalance.minus(entryAmount).toNumber();
            }
        }
        else {
            if (account.accountType === orm_entities_1.AccountType.ASSET || account.accountType === orm_entities_1.AccountType.EXPENSE) {
                return currentBalance.minus(entryAmount).toNumber();
            }
            else {
                return currentBalance.plus(entryAmount).toNumber();
            }
        }
    }
    async updateAccountBalance(queryRunner, account, entry) {
        const newBalance = this.applyEntryToBalance(account, entry);
        const entryAmount = new decimal_js_1.Decimal(entry.amount);
        const updates = {
            balance: newBalance,
            updatedAt: new Date(),
        };
        if (entry.type === 'debit') {
            updates.debitBalance = new decimal_js_1.Decimal(account.debitBalance).plus(entryAmount).toNumber();
        }
        else {
            updates.creditBalance = new decimal_js_1.Decimal(account.creditBalance).plus(entryAmount).toNumber();
        }
        await queryRunner.manager.update(orm_entities_1.LedgerAccountOrmEntity, account.id, updates);
        Object.assign(account, updates);
    }
    async getSystemCashAccount() {
        const systemAccount = await this.accountRepository.findOne({
            where: {
                accountName: 'SYSTEM_CASH',
                accountType: orm_entities_1.AccountType.ASSET,
                isActive: true
            },
        });
        if (!systemAccount) {
            throw new Error('System cash account not found');
        }
        return systemAccount.id;
    }
    generateTransactionId() {
        return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateTransactionReference() {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        return `TXN${date}${random}`;
    }
};
exports.DoubleEntryService = DoubleEntryService;
exports.DoubleEntryService = DoubleEntryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(orm_entities_1.LedgerAccountOrmEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(orm_entities_1.TransactionOrmEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(orm_entities_1.TransactionEntryOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], DoubleEntryService);
//# sourceMappingURL=double-entry.service.js.map