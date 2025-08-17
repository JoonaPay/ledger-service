import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LedgerService } from '../domain/services/ledger.service';
import { KafkaService } from '@shared/kafka/kafka.service';
import { AccountType } from '../domain/entities/account.entity';
import { MetricsService } from '@shared/metrics/metrics.service';

export interface IdentityUserCreatedEvent {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  preferredCurrency?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface IdentityUserUpdatedEvent {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  preferredCurrency?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface IdentityUserDeletedEvent {
  userId: string;
  email: string;
  timestamp: string;
}

@Injectable()
export class IdentityEventHandler {
  private readonly logger = new Logger(IdentityEventHandler.name);

  constructor(
    private readonly ledgerService: LedgerService,
    private readonly kafkaService: KafkaService,
    private readonly metricsService: MetricsService,
  ) {}

  @OnEvent('identity.user.created')
  async handleUserCreated(event: IdentityUserCreatedEvent) {
    try {
      this.logger.log(`Creating ledger accounts for new user: ${event.userId}`);

      const defaultCurrency = event.preferredCurrency || 'USD';
      const userName = event.firstName && event.lastName 
        ? `${event.firstName} ${event.lastName}` 
        : event.email;

      const account = await this.ledgerService.createAccount({
        name: `${userName} Wallet (${defaultCurrency})`,
        type: AccountType.USER_WALLET,
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
        type: AccountType.USER_WALLET,
        balance: 0,
        createdFromIdentity: true,
      });

      this.metricsService.recordLedgerOperation('user_account_created', 'success');
      this.logger.log(`✅ Ledger account created for user ${event.userId}: ${account.id}`);

    } catch (error) {
      this.logger.error(`❌ Failed to create ledger account for user ${event.userId}:`, error);
      this.metricsService.recordLedgerOperation('user_account_created', 'failure');
      this.metricsService.recordError('user_account_creation', 'high');
    }
  }

  @OnEvent('identity.user.updated')
  async handleUserUpdated(event: IdentityUserUpdatedEvent) {
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
        const hasPreferredCurrencyAccount = userAccounts.some(
          account => account.currency === event.preferredCurrency
        );

        if (!hasPreferredCurrencyAccount) {
          this.logger.log(`Creating new wallet for preferred currency: ${event.preferredCurrency}`);
          
          const userName = event.firstName && event.lastName 
            ? `${event.firstName} ${event.lastName}` 
            : event.email;

          await this.ledgerService.createAccount({
            name: `${userName} Wallet (${event.preferredCurrency})`,
            type: AccountType.USER_WALLET,
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

    } catch (error) {
      this.logger.error(`❌ Failed to process user update for ledger accounts ${event.userId}:`, error);
      this.metricsService.recordLedgerOperation('user_account_updated', 'failure');
      this.metricsService.recordError('user_account_update', 'medium');
    }
  }

  @OnEvent('identity.user.deleted')
  async handleUserDeleted(event: IdentityUserDeletedEvent) {
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

    } catch (error) {
      this.logger.error(`❌ Failed to process user deletion for ledger accounts ${event.userId}:`, error);
      this.metricsService.recordLedgerOperation('user_account_deleted', 'failure');
      this.metricsService.recordError('user_account_deletion', 'medium');
    }
  }
}