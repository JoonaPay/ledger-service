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
var BlnkFinanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlnkFinanceService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const metrics_service_1 = require("../../../../shared/metrics/metrics.service");
const rxjs_1 = require("rxjs");
const schedule_1 = require("@nestjs/schedule");
const orm_entities_1 = require("../orm-entities");
let BlnkFinanceService = BlnkFinanceService_1 = class BlnkFinanceService {
    constructor(configService, httpService, metricsService, accountRepository, reconciliationRepository) {
        this.configService = configService;
        this.httpService = httpService;
        this.metricsService = metricsService;
        this.accountRepository = accountRepository;
        this.reconciliationRepository = reconciliationRepository;
        this.logger = new common_1.Logger(BlnkFinanceService_1.name);
        this.baseUrl = this.configService.get('blnkfinance.url');
        this.apiKey = this.configService.get('blnkfinance.apiKey');
        this.organization = this.configService.get('blnkfinance.organization');
        this.timeout = this.configService.get('blnkfinance.timeout', 30000);
    }
    async createAccount(accountData) {
        try {
            this.logger.log(`Creating account: ${accountData.account_name}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/accounts`, {
                ...accountData,
                organization_id: this.organization,
            }, {
                headers: this.getHeaders(),
                timeout: this.timeout,
            }));
            this.metricsService.recordLedgerOperation('create_account', 'success');
            this.metricsService.recordAccountOperation('create', accountData.account_type);
            this.metricsService.setBlnkFinanceHealth(true);
            this.logger.log(`Account created successfully: ${response.data.account_id}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to create account: ${error.message}`, error.stack);
            this.metricsService.recordLedgerOperation('create_account', 'failure');
            this.metricsService.recordError('blnkfinance_create_account', 'high');
            this.metricsService.setBlnkFinanceHealth(false);
            throw error;
        }
    }
    async getAccount(accountId) {
        try {
            this.logger.log(`Fetching account: ${accountId}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/accounts/${accountId}`, {
                headers: this.getHeaders(),
                timeout: this.timeout,
            }));
            this.metricsService.recordLedgerOperation('get_account', 'success');
            this.metricsService.setBlnkFinanceHealth(true);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get account ${accountId}: ${error.message}`, error.stack);
            this.metricsService.recordLedgerOperation('get_account', 'failure');
            this.metricsService.recordError('blnkfinance_get_account', 'medium');
            this.metricsService.setBlnkFinanceHealth(false);
            throw error;
        }
    }
    async updateAccountBalance(accountId, balance) {
        try {
            this.logger.log(`Updating account balance: ${accountId} to ${balance}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.patch(`${this.baseUrl}/accounts/${accountId}/balance`, { balance }, {
                headers: this.getHeaders(),
                timeout: this.timeout,
            }));
            this.metricsService.recordLedgerOperation('update_balance', 'success');
            this.metricsService.recordAccountOperation('update_balance', 'unknown');
            this.metricsService.setBlnkFinanceHealth(true);
            const account = response.data;
            this.metricsService.updateAccountBalance(account.account_id, account.account_type, account.currency, account.balance);
            return account;
        }
        catch (error) {
            this.logger.error(`Failed to update account balance ${accountId}: ${error.message}`, error.stack);
            this.metricsService.recordLedgerOperation('update_balance', 'failure');
            this.metricsService.recordError('blnkfinance_update_balance', 'high');
            this.metricsService.setBlnkFinanceHealth(false);
            throw error;
        }
    }
    async createTransaction(transactionData) {
        try {
            this.logger.log(`Creating transaction: ${transactionData.reference}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/transactions`, {
                ...transactionData,
                organization_id: this.organization,
            }, {
                headers: this.getHeaders(),
                timeout: this.timeout,
            }));
            this.metricsService.recordLedgerOperation('create_transaction', 'success');
            this.metricsService.recordTransaction('transfer', 'success');
            this.metricsService.setBlnkFinanceHealth(true);
            this.logger.log(`Transaction created successfully: ${response.data.transaction_id}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to create transaction: ${error.message}`, error.stack);
            this.metricsService.recordLedgerOperation('create_transaction', 'failure');
            this.metricsService.recordTransaction('transfer', 'failure');
            this.metricsService.recordError('blnkfinance_create_transaction', 'critical');
            this.metricsService.setBlnkFinanceHealth(false);
            throw error;
        }
    }
    async getTransaction(transactionId) {
        try {
            this.logger.log(`Fetching transaction: ${transactionId}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/transactions/${transactionId}`, {
                headers: this.getHeaders(),
                timeout: this.timeout,
            }));
            this.metricsService.recordLedgerOperation('get_transaction', 'success');
            this.metricsService.setBlnkFinanceHealth(true);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get transaction ${transactionId}: ${error.message}`, error.stack);
            this.metricsService.recordLedgerOperation('get_transaction', 'failure');
            this.metricsService.recordError('blnkfinance_get_transaction', 'medium');
            this.metricsService.setBlnkFinanceHealth(false);
            throw error;
        }
    }
    async getAccountTransactions(accountId, limit = 50, offset = 0) {
        try {
            this.logger.log(`Fetching transactions for account: ${accountId}`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/accounts/${accountId}/transactions`, {
                headers: this.getHeaders(),
                params: { limit, offset },
                timeout: this.timeout,
            }));
            this.metricsService.recordLedgerOperation('get_account_transactions', 'success');
            this.metricsService.setBlnkFinanceHealth(true);
            return response.data.transactions || [];
        }
        catch (error) {
            this.logger.error(`Failed to get account transactions ${accountId}: ${error.message}`, error.stack);
            this.metricsService.recordLedgerOperation('get_account_transactions', 'failure');
            this.metricsService.recordError('blnkfinance_get_account_transactions', 'medium');
            this.metricsService.setBlnkFinanceHealth(false);
            throw error;
        }
    }
    async checkHealth() {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/health`, {
                headers: this.getHeaders(),
                timeout: 5000,
            }));
            const isHealthy = response.status === 200;
            this.metricsService.setBlnkFinanceHealth(isHealthy);
            return isHealthy;
        }
        catch (error) {
            this.logger.error(`BlnkFinance health check failed: ${error.message}`);
            this.metricsService.setBlnkFinanceHealth(false);
            this.metricsService.recordError('blnkfinance_health_check', 'medium');
            return false;
        }
    }
    async syncAccountWithBlnk(accountId) {
        try {
            const account = await this.accountRepository.findOne({
                where: { id: accountId },
            });
            if (!account) {
                throw new Error(`Account ${accountId} not found`);
            }
            if (!account.blnkAccountId) {
                const blnkAccount = await this.createAccount({
                    account_name: account.accountName,
                    account_type: account.accountType,
                    currency: account.currency,
                    opening_balance: account.balance,
                    metadata: {
                        internal_account_id: account.id,
                        user_id: account.userId,
                    },
                });
                await this.accountRepository.update(accountId, {
                    blnkAccountId: blnkAccount.account_id,
                });
                return {
                    accountId,
                    internalBalance: account.balance,
                    externalBalance: blnkAccount.balance,
                    variance: Math.abs(account.balance - blnkAccount.balance),
                    status: 'synced',
                };
            }
            else {
                const blnkAccount = await this.getAccount(account.blnkAccountId);
                const variance = Math.abs(account.balance - blnkAccount.balance);
                const tolerance = 0.01;
                return {
                    accountId,
                    internalBalance: account.balance,
                    externalBalance: blnkAccount.balance,
                    variance,
                    status: variance <= tolerance ? 'synced' : 'variance',
                    message: variance > tolerance ? `Balance variance detected: ${variance}` : undefined,
                };
            }
        }
        catch (error) {
            this.logger.error(`Failed to sync account ${accountId}: ${error.message}`, error.stack);
            return {
                accountId,
                internalBalance: 0,
                externalBalance: 0,
                variance: 0,
                status: 'error',
                message: error.message,
            };
        }
    }
    async syncAllAccounts() {
        const accounts = await this.accountRepository.find({
            where: { isActive: true },
        });
        const results = [];
        for (const account of accounts) {
            const result = await this.syncAccountWithBlnk(account.id);
            results.push(result);
            if (result.status === 'variance') {
                await this.createReconciliationLog(account.id, result);
            }
        }
        return results;
    }
    async postTransactionToBlnk(sourceAccountId, destinationAccountId, amount, currency, reference, description, metadata) {
        const [sourceAccount, destAccount] = await Promise.all([
            this.accountRepository.findOne({ where: { id: sourceAccountId } }),
            this.accountRepository.findOne({ where: { id: destinationAccountId } }),
        ]);
        if (!sourceAccount?.blnkAccountId || !destAccount?.blnkAccountId) {
            throw new Error('One or both accounts are not synchronized with BlnkFinance');
        }
        return this.createTransaction({
            reference,
            amount,
            currency,
            description,
            source_account_id: sourceAccount.blnkAccountId,
            destination_account_id: destAccount.blnkAccountId,
            metadata: {
                ...metadata,
                internal_source_account_id: sourceAccountId,
                internal_destination_account_id: destinationAccountId,
            },
        });
    }
    async handleWebhookEvent(event) {
        this.logger.log(`Received BlnkFinance webhook event: ${event.event_type}`);
        try {
            switch (event.event_type) {
                case 'account.created':
                    await this.handleAccountCreated(event.data.account);
                    break;
                case 'account.updated':
                    await this.handleAccountUpdated(event.data.account);
                    break;
                case 'transaction.completed':
                    await this.handleTransactionCompleted(event.data.transaction);
                    break;
                case 'transaction.failed':
                    await this.handleTransactionFailed(event.data.transaction);
                    break;
                case 'balance.updated':
                    await this.handleBalanceUpdated(event.data.balance);
                    break;
                default:
                    this.logger.warn(`Unhandled webhook event type: ${event.event_type}`);
            }
            this.metricsService.recordLedgerOperation('webhook_processed', 'success');
        }
        catch (error) {
            this.logger.error(`Failed to process webhook event: ${error.message}`, error.stack);
            this.metricsService.recordLedgerOperation('webhook_processed', 'failure');
            throw error;
        }
    }
    async reconcileAccount(accountId) {
        const syncResult = await this.syncAccountWithBlnk(accountId);
        if (syncResult.status === 'variance') {
            await this.createReconciliationLog(accountId, syncResult);
            const tolerance = this.configService.get('blnkfinance.autoCorrectTolerance', 0.05);
            if (syncResult.variance <= tolerance) {
                await this.autoCorrectVariance(accountId, syncResult);
            }
        }
    }
    async performAutomatedReconciliation() {
        this.logger.log('Starting automated BlnkFinance reconciliation...');
        try {
            const results = await this.syncAllAccounts();
            const varianceCount = results.filter(r => r.status === 'variance').length;
            const errorCount = results.filter(r => r.status === 'error').length;
            this.logger.log(`Reconciliation completed: ${results.length} accounts processed, ${varianceCount} variances, ${errorCount} errors`);
            if (varianceCount > 0 || errorCount > 0) {
                this.metricsService.recordError('blnkfinance_reconciliation_issues', 'medium');
            }
        }
        catch (error) {
            this.logger.error('Automated reconciliation failed:', error);
            this.metricsService.recordError('blnkfinance_reconciliation_failed', 'high');
        }
    }
    async handleAccountCreated(account) {
        const internalAccountId = account.metadata?.internal_account_id;
        if (internalAccountId) {
            await this.accountRepository.update(internalAccountId, {
                blnkAccountId: account.account_id,
            });
        }
    }
    async handleAccountUpdated(account) {
        const internalAccount = await this.accountRepository.findOne({
            where: { blnkAccountId: account.account_id },
        });
        if (internalAccount) {
            const variance = Math.abs(internalAccount.balance - account.balance);
            if (variance > 0.01) {
                await this.createReconciliationLog(internalAccount.id, {
                    accountId: internalAccount.id,
                    internalBalance: internalAccount.balance,
                    externalBalance: account.balance,
                    variance,
                    status: 'variance',
                    message: 'Balance updated in BlnkFinance',
                });
            }
        }
    }
    async handleTransactionCompleted(transaction) {
        this.logger.log(`BlnkFinance transaction completed: ${transaction.transaction_id}`);
    }
    async handleTransactionFailed(transaction) {
        this.logger.error(`BlnkFinance transaction failed: ${transaction.transaction_id}`);
    }
    async handleBalanceUpdated(balanceData) {
        const internalAccount = await this.accountRepository.findOne({
            where: { blnkAccountId: balanceData.account_id },
        });
        if (internalAccount) {
            const variance = Math.abs(internalAccount.balance - balanceData.balance);
            if (variance > 0.01) {
                await this.createReconciliationLog(internalAccount.id, {
                    accountId: internalAccount.id,
                    internalBalance: internalAccount.balance,
                    externalBalance: balanceData.balance,
                    variance,
                    status: 'variance',
                    message: 'Balance updated via webhook',
                });
            }
        }
    }
    async createReconciliationLog(accountId, syncResult) {
        const account = await this.accountRepository.findOne({
            where: { id: accountId },
        });
        if (!account)
            return;
        const reconciliationLog = this.reconciliationRepository.create({
            accountId,
            reconciliationDate: new Date(),
            reconciliationType: orm_entities_1.ReconciliationType.EXTERNAL_BLNK,
            externalSource: 'BLNK_FINANCE',
            internalBalance: syncResult.internalBalance,
            externalBalance: syncResult.externalBalance,
            varianceAmount: syncResult.variance,
            currency: account.currency,
            blnkAccountId: account.blnkAccountId,
            blnkBalance: syncResult.externalBalance,
            blnkSyncStatus: syncResult.status === 'synced' ? orm_entities_1.BlnkSyncStatus.SYNCED : orm_entities_1.BlnkSyncStatus.OUT_OF_SYNC,
            varianceReason: syncResult.message,
            metadata: {
                syncTimestamp: new Date().toISOString(),
                autoGenerated: true,
            },
        });
        await this.reconciliationRepository.save(reconciliationLog);
    }
    async autoCorrectVariance(accountId, syncResult) {
        this.logger.log(`Auto-correcting variance for account ${accountId}: ${syncResult.variance}`);
        try {
            await this.updateAccountBalance((await this.accountRepository.findOne({ where: { id: accountId } }))?.blnkAccountId, syncResult.internalBalance);
            await this.reconciliationRepository.update({ accountId, reconciliationDate: new Date() }, {
                resolutionAction: 'EXTERNAL_CORRECTION',
                resolutionNotes: `Auto-corrected variance of ${syncResult.variance}`,
                reconciledAt: new Date(),
                reconciledBy: 'SYSTEM_AUTO_CORRECT',
            });
            this.logger.log(`Variance auto-corrected for account ${accountId}`);
        }
        catch (error) {
            this.logger.error(`Failed to auto-correct variance for account ${accountId}:`, error);
        }
    }
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-Organization': this.organization,
        };
    }
};
exports.BlnkFinanceService = BlnkFinanceService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlnkFinanceService.prototype, "performAutomatedReconciliation", null);
exports.BlnkFinanceService = BlnkFinanceService = BlnkFinanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectRepository)(orm_entities_1.LedgerAccountOrmEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(orm_entities_1.ReconciliationLogOrmEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService,
        metrics_service_1.MetricsService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BlnkFinanceService);
//# sourceMappingURL=blnkfinance.service.js.map