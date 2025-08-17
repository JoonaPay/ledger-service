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
var LedgerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const metrics_service_1 = require("../../../../../shared/metrics/metrics.service");
const blnkfinance_service_1 = require("../../../infrastructure/external/blnkfinance.service");
const account_entity_1 = require("../entities/account.entity");
const transaction_entity_1 = require("../entities/transaction.entity");
let LedgerService = LedgerService_1 = class LedgerService {
    constructor(accountRepository, transactionRepository, blnkFinanceService, eventEmitter, metricsService) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.blnkFinanceService = blnkFinanceService;
        this.eventEmitter = eventEmitter;
        this.metricsService = metricsService;
        this.logger = new common_1.Logger(LedgerService_1.name);
    }
    async createAccount(request) {
        try {
            this.logger.log(`Creating account: ${request.name} (${request.type})`);
            const accountId = this.generateId();
            const account = account_entity_1.Account.create({
                id: accountId,
                name: request.name,
                type: request.type,
                currency: request.currency,
                balance: request.initialBalance || 0,
                availableBalance: request.initialBalance || 0,
                ownerId: request.ownerId,
                parentAccountId: request.parentAccountId,
                metadata: request.metadata,
            });
            const savedAccount = await this.accountRepository.create(account);
            await this.blnkFinanceService.createAccount({
                account_name: request.name,
                account_type: request.type,
                currency: request.currency,
                opening_balance: request.initialBalance || 0,
                metadata: {
                    ...request.metadata,
                    ledger_account_id: accountId,
                    owner_id: request.ownerId,
                },
            });
            this.eventEmitter.emit('account.created', {
                accountId: savedAccount.id,
                ownerId: savedAccount.ownerId,
                type: savedAccount.type,
                currency: savedAccount.currency,
                balance: savedAccount.balance,
            });
            this.metricsService.recordAccountOperation('create', request.type);
            this.metricsService.updateAccountBalance(savedAccount.id, savedAccount.type, savedAccount.currency, savedAccount.balance);
            this.logger.log(`Account created successfully: ${savedAccount.id}`);
            return savedAccount;
        }
        catch (error) {
            this.logger.error(`Failed to create account: ${error.message}`, error.stack);
            this.metricsService.recordError('create_account', 'high');
            throw error;
        }
    }
    async getAccount(accountId) {
        const account = await this.accountRepository.findById(accountId);
        if (!account) {
            throw new common_1.NotFoundException(`Account not found: ${accountId}`);
        }
        return account;
    }
    async getUserAccounts(ownerId) {
        return this.accountRepository.findByOwnerId(ownerId);
    }
    async transfer(request) {
        try {
            this.logger.log(`Processing transfer: ${request.amount} ${request.currency} from ${request.sourceAccountId} to ${request.destinationAccountId}`);
            const [sourceAccount, destinationAccount] = await Promise.all([
                this.getAccount(request.sourceAccountId),
                this.getAccount(request.destinationAccountId),
            ]);
            this.validateTransfer(sourceAccount, destinationAccount, request.amount, request.currency);
            const transactionId = this.generateId();
            const reference = request.reference || this.generateReference();
            const entries = [
                new transaction_entity_1.TransactionEntry(request.sourceAccountId, request.amount, 'debit', `Transfer to ${destinationAccount.name}`),
                new transaction_entity_1.TransactionEntry(request.destinationAccountId, request.amount, 'credit', `Transfer from ${sourceAccount.name}`),
            ];
            const transaction = transaction_entity_1.Transaction.create({
                id: transactionId,
                reference,
                type: transaction_entity_1.TransactionType.TRANSFER,
                amount: request.amount,
                currency: request.currency,
                description: request.description,
                entries,
                sourceAccountId: request.sourceAccountId,
                destinationAccountId: request.destinationAccountId,
                initiatedBy: request.initiatedBy,
                metadata: request.metadata,
            });
            const savedTransaction = await this.transactionRepository.create(transaction);
            await this.blnkFinanceService.createTransaction({
                reference,
                amount: request.amount,
                currency: request.currency,
                description: request.description,
                source_account_id: request.sourceAccountId,
                destination_account_id: request.destinationAccountId,
                metadata: {
                    ...request.metadata,
                    ledger_transaction_id: transactionId,
                    initiated_by: request.initiatedBy,
                },
            });
            const updatedSourceAccount = sourceAccount.updateBalance(sourceAccount.balance - request.amount, sourceAccount.availableBalance - request.amount);
            const updatedDestinationAccount = destinationAccount.updateBalance(destinationAccount.balance + request.amount, destinationAccount.availableBalance + request.amount);
            await Promise.all([
                this.accountRepository.update(updatedSourceAccount),
                this.accountRepository.update(updatedDestinationAccount),
            ]);
            const completedTransaction = savedTransaction.updateStatus(transaction_entity_1.TransactionStatus.COMPLETED);
            await this.transactionRepository.update(completedTransaction);
            this.eventEmitter.emit('transaction.completed', {
                transactionId: completedTransaction.id,
                type: transaction_entity_1.TransactionType.TRANSFER,
                amount: request.amount,
                currency: request.currency,
                sourceAccountId: request.sourceAccountId,
                destinationAccountId: request.destinationAccountId,
                initiatedBy: request.initiatedBy,
            });
            this.metricsService.recordTransaction('transfer', 'success');
            this.metricsService.updateAccountBalance(updatedSourceAccount.id, updatedSourceAccount.type, updatedSourceAccount.currency, updatedSourceAccount.balance);
            this.metricsService.updateAccountBalance(updatedDestinationAccount.id, updatedDestinationAccount.type, updatedDestinationAccount.currency, updatedDestinationAccount.balance);
            this.logger.log(`Transfer completed successfully: ${completedTransaction.id}`);
            return completedTransaction;
        }
        catch (error) {
            this.logger.error(`Transfer failed: ${error.message}`, error.stack);
            this.metricsService.recordTransaction('transfer', 'failure');
            this.metricsService.recordError('transfer', 'critical');
            throw error;
        }
    }
    async deposit(request) {
        try {
            this.logger.log(`Processing deposit: ${request.amount} ${request.currency} to ${request.accountId}`);
            const account = await this.getAccount(request.accountId);
            this.validateDeposit(account, request.amount, request.currency);
            const transactionId = this.generateId();
            const reference = request.reference || this.generateReference();
            const systemAccount = await this.getOrCreateSystemAccount(account_entity_1.AccountType.SYSTEM_RESERVE, request.currency);
            const entries = [
                new transaction_entity_1.TransactionEntry(systemAccount.id, request.amount, 'debit', `Deposit source`),
                new transaction_entity_1.TransactionEntry(request.accountId, request.amount, 'credit', `Deposit to ${account.name}`),
            ];
            const transaction = transaction_entity_1.Transaction.create({
                id: transactionId,
                reference,
                type: transaction_entity_1.TransactionType.DEPOSIT,
                amount: request.amount,
                currency: request.currency,
                description: request.description,
                entries,
                destinationAccountId: request.accountId,
                initiatedBy: request.initiatedBy,
                metadata: request.metadata,
            });
            const savedTransaction = await this.transactionRepository.create(transaction);
            const updatedAccount = account.updateBalance(account.balance + request.amount, account.availableBalance + request.amount);
            await this.accountRepository.update(updatedAccount);
            const completedTransaction = savedTransaction.updateStatus(transaction_entity_1.TransactionStatus.COMPLETED);
            await this.transactionRepository.update(completedTransaction);
            this.eventEmitter.emit('transaction.completed', {
                transactionId: completedTransaction.id,
                type: transaction_entity_1.TransactionType.DEPOSIT,
                amount: request.amount,
                currency: request.currency,
                destinationAccountId: request.accountId,
                initiatedBy: request.initiatedBy,
            });
            this.metricsService.recordTransaction('deposit', 'success');
            this.metricsService.updateAccountBalance(updatedAccount.id, updatedAccount.type, updatedAccount.currency, updatedAccount.balance);
            this.logger.log(`Deposit completed successfully: ${completedTransaction.id}`);
            return completedTransaction;
        }
        catch (error) {
            this.logger.error(`Deposit failed: ${error.message}`, error.stack);
            this.metricsService.recordTransaction('deposit', 'failure');
            this.metricsService.recordError('deposit', 'high');
            throw error;
        }
    }
    async withdraw(request) {
        try {
            this.logger.log(`Processing withdrawal: ${request.amount} ${request.currency} from ${request.accountId}`);
            const account = await this.getAccount(request.accountId);
            this.validateWithdrawal(account, request.amount, request.currency);
            const transactionId = this.generateId();
            const reference = request.reference || this.generateReference();
            const systemAccount = await this.getOrCreateSystemAccount(account_entity_1.AccountType.SYSTEM_RESERVE, request.currency);
            const entries = [
                new transaction_entity_1.TransactionEntry(request.accountId, request.amount, 'debit', `Withdrawal from ${account.name}`),
                new transaction_entity_1.TransactionEntry(systemAccount.id, request.amount, 'credit', `Withdrawal destination`),
            ];
            const transaction = transaction_entity_1.Transaction.create({
                id: transactionId,
                reference,
                type: transaction_entity_1.TransactionType.WITHDRAWAL,
                amount: request.amount,
                currency: request.currency,
                description: request.description,
                entries,
                sourceAccountId: request.accountId,
                initiatedBy: request.initiatedBy,
                metadata: request.metadata,
            });
            const savedTransaction = await this.transactionRepository.create(transaction);
            const updatedAccount = account.updateBalance(account.balance - request.amount, account.availableBalance - request.amount);
            await this.accountRepository.update(updatedAccount);
            const completedTransaction = savedTransaction.updateStatus(transaction_entity_1.TransactionStatus.COMPLETED);
            await this.transactionRepository.update(completedTransaction);
            this.eventEmitter.emit('transaction.completed', {
                transactionId: completedTransaction.id,
                type: transaction_entity_1.TransactionType.WITHDRAWAL,
                amount: request.amount,
                currency: request.currency,
                sourceAccountId: request.accountId,
                initiatedBy: request.initiatedBy,
            });
            this.metricsService.recordTransaction('withdrawal', 'success');
            this.metricsService.updateAccountBalance(updatedAccount.id, updatedAccount.type, updatedAccount.currency, updatedAccount.balance);
            this.logger.log(`Withdrawal completed successfully: ${completedTransaction.id}`);
            return completedTransaction;
        }
        catch (error) {
            this.logger.error(`Withdrawal failed: ${error.message}`, error.stack);
            this.metricsService.recordTransaction('withdrawal', 'failure');
            this.metricsService.recordError('withdrawal', 'high');
            throw error;
        }
    }
    async getTransaction(transactionId) {
        const transaction = await this.transactionRepository.findById(transactionId);
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction not found: ${transactionId}`);
        }
        return transaction;
    }
    async getAccountTransactions(accountId, page = 1, limit = 50) {
        await this.getAccount(accountId);
        return this.transactionRepository.findByAccountId(accountId, page, limit);
    }
    validateTransfer(sourceAccount, destinationAccount, amount, currency) {
        if (!sourceAccount.canDebit(amount)) {
            throw new common_1.BadRequestException('Insufficient funds or account not active');
        }
        if (!destinationAccount.canCredit()) {
            throw new common_1.BadRequestException('Destination account cannot receive credits');
        }
        if (sourceAccount.currency !== currency || destinationAccount.currency !== currency) {
            throw new common_1.BadRequestException('Currency mismatch');
        }
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be positive');
        }
    }
    validateDeposit(account, amount, currency) {
        if (!account.canCredit()) {
            throw new common_1.BadRequestException('Account cannot receive credits');
        }
        if (account.currency !== currency) {
            throw new common_1.BadRequestException('Currency mismatch');
        }
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be positive');
        }
    }
    validateWithdrawal(account, amount, currency) {
        if (!account.canDebit(amount)) {
            throw new common_1.BadRequestException('Insufficient funds or account not active');
        }
        if (account.currency !== currency) {
            throw new common_1.BadRequestException('Currency mismatch');
        }
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be positive');
        }
    }
    async getOrCreateSystemAccount(type, currency) {
        let systemAccount = await this.accountRepository.findSystemAccount(type, currency);
        if (!systemAccount) {
            const name = `${type.toUpperCase()} (${currency})`;
            systemAccount = await this.accountRepository.createSystemAccount(type, currency, name);
        }
        return systemAccount;
    }
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    generateReference() {
        return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
};
exports.LedgerService = LedgerService;
exports.LedgerService = LedgerService = LedgerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, Object, blnkfinance_service_1.BlnkFinanceService,
        event_emitter_1.EventEmitter2,
        metrics_service_1.MetricsService])
], LedgerService);
//# sourceMappingURL=ledger.service.js.map