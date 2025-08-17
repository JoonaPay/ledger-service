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
var IdentityEventHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityEventHandler = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const ledger_service_1 = require("../domain/services/ledger.service");
const kafka_service_1 = require("../../../../shared/kafka/kafka.service");
const account_entity_1 = require("../domain/entities/account.entity");
const metrics_service_1 = require("../../../../shared/metrics/metrics.service");
let IdentityEventHandler = IdentityEventHandler_1 = class IdentityEventHandler {
    constructor(ledgerService, kafkaService, metricsService) {
        this.ledgerService = ledgerService;
        this.kafkaService = kafkaService;
        this.metricsService = metricsService;
        this.logger = new common_1.Logger(IdentityEventHandler_1.name);
    }
    async handleUserCreated(event) {
        try {
            this.logger.log(`Creating ledger accounts for new user: ${event.userId}`);
            const defaultCurrency = event.preferredCurrency || 'USD';
            const userName = event.firstName && event.lastName
                ? `${event.firstName} ${event.lastName}`
                : event.email;
            const account = await this.ledgerService.createAccount({
                name: `${userName} Wallet (${defaultCurrency})`,
                type: account_entity_1.AccountType.USER_WALLET,
                currency: defaultCurrency,
                ownerId: event.userId,
                initialBalance: 0,
                metadata: {
                    email: event.email,
                    firstName: event.firstName,
                    lastName: event.lastName,
                    createdFromIdentity: true,
                    identityTimestamp: event.timestamp,
                    ...event.metadata,
                },
            });
            await this.kafkaService.publishAccountCreated({
                accountId: account.id,
                userId: event.userId,
                email: event.email,
                currency: defaultCurrency,
                type: account_entity_1.AccountType.USER_WALLET,
                balance: 0,
                createdFromIdentity: true,
            });
            this.metricsService.recordLedgerOperation('user_account_created', 'success');
            this.logger.log(`✅ Ledger account created for user ${event.userId}: ${account.id}`);
        }
        catch (error) {
            this.logger.error(`❌ Failed to create ledger account for user ${event.userId}:`, error);
            this.metricsService.recordLedgerOperation('user_account_created', 'failure');
            this.metricsService.recordError('user_account_creation', 'high');
        }
    }
    async handleUserUpdated(event) {
        try {
            this.logger.log(`Processing user update for ledger accounts: ${event.userId}`);
            const userAccounts = await this.ledgerService.getUserAccounts(event.userId);
            if (userAccounts.length === 0) {
                this.logger.warn(`No ledger accounts found for user ${event.userId}, creating default account`);
                await this.handleUserCreated({
                    userId: event.userId,
                    email: event.email || 'unknown@example.com',
                    firstName: event.firstName,
                    lastName: event.lastName,
                    preferredCurrency: event.preferredCurrency,
                    metadata: event.metadata,
                    timestamp: event.timestamp,
                });
                return;
            }
            if (event.preferredCurrency) {
                const hasPreferredCurrencyAccount = userAccounts.some(account => account.currency === event.preferredCurrency);
                if (!hasPreferredCurrencyAccount) {
                    this.logger.log(`Creating new wallet for preferred currency: ${event.preferredCurrency}`);
                    const userName = event.firstName && event.lastName
                        ? `${event.firstName} ${event.lastName}`
                        : event.email;
                    await this.ledgerService.createAccount({
                        name: `${userName} Wallet (${event.preferredCurrency})`,
                        type: account_entity_1.AccountType.USER_WALLET,
                        currency: event.preferredCurrency,
                        ownerId: event.userId,
                        initialBalance: 0,
                        metadata: {
                            email: event.email,
                            firstName: event.firstName,
                            lastName: event.lastName,
                            updatedFromIdentity: true,
                            identityTimestamp: event.timestamp,
                            ...event.metadata,
                        },
                    });
                }
            }
            this.metricsService.recordLedgerOperation('user_account_updated', 'success');
            this.logger.log(`✅ Processed user update for ledger accounts: ${event.userId}`);
        }
        catch (error) {
            this.logger.error(`❌ Failed to process user update for ledger accounts ${event.userId}:`, error);
            this.metricsService.recordLedgerOperation('user_account_updated', 'failure');
            this.metricsService.recordError('user_account_update', 'medium');
        }
    }
    async handleUserDeleted(event) {
        try {
            this.logger.log(`Processing user deletion for ledger accounts: ${event.userId}`);
            const userAccounts = await this.ledgerService.getUserAccounts(event.userId);
            for (const account of userAccounts) {
                if (account.balance > 0) {
                    this.logger.warn(`⚠️ User ${event.userId} has non-zero balance in account ${account.id}: ${account.balance} ${account.currency}`);
                }
                this.logger.log(`Setting account ${account.id} to inactive for deleted user ${event.userId}`);
            }
            await this.kafkaService.publishLedgerEvent('user.accounts.deactivated', {
                userId: event.userId,
                email: event.email,
                accountIds: userAccounts.map(account => account.id),
                accounts: userAccounts.map(account => ({
                    id: account.id,
                    currency: account.currency,
                    balance: account.balance,
                    type: account.type,
                })),
                deletedAt: event.timestamp,
            });
            this.metricsService.recordLedgerOperation('user_account_deleted', 'success');
            this.logger.log(`✅ Processed user deletion for ledger accounts: ${event.userId}`);
        }
        catch (error) {
            this.logger.error(`❌ Failed to process user deletion for ledger accounts ${event.userId}:`, error);
            this.metricsService.recordLedgerOperation('user_account_deleted', 'failure');
            this.metricsService.recordError('user_account_deletion', 'medium');
        }
    }
};
exports.IdentityEventHandler = IdentityEventHandler;
__decorate([
    (0, event_emitter_1.OnEvent)('identity.user.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IdentityEventHandler.prototype, "handleUserCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('identity.user.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IdentityEventHandler.prototype, "handleUserUpdated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('identity.user.deleted'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IdentityEventHandler.prototype, "handleUserDeleted", null);
exports.IdentityEventHandler = IdentityEventHandler = IdentityEventHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ledger_service_1.LedgerService,
        kafka_service_1.KafkaService,
        metrics_service_1.MetricsService])
], IdentityEventHandler);
//# sourceMappingURL=identity-event.handler.js.map