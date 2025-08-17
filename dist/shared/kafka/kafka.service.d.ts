import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MetricsService } from '@shared/metrics/metrics.service';
export interface KafkaTopics {
    IDENTITY_EVENTS: 'identity.events';
    LEDGER_EVENTS: 'ledger.events';
    USER_CREATED: 'user.created';
    USER_UPDATED: 'user.updated';
    USER_DELETED: 'user.deleted';
    ACCOUNT_CREATED: 'account.created';
    TRANSACTION_COMPLETED: 'transaction.completed';
}
export declare const KAFKA_TOPICS: KafkaTopics;
export declare class KafkaService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly eventEmitter;
    private readonly metricsService;
    private readonly logger;
    private kafka;
    private consumer;
    private producer;
    private readonly brokers;
    private readonly clientId;
    private readonly groupId;
    constructor(configService: ConfigService, eventEmitter: EventEmitter2, metricsService: MetricsService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private subscribeToTopics;
    private startConsuming;
    private handleMessage;
    private handleIdentityEvent;
    private handleUserCreated;
    private handleUserUpdated;
    private handleUserDeleted;
    publishEvent(topic: string, event: any, key?: string): Promise<void>;
    publishLedgerEvent(eventType: string, data: any): Promise<void>;
    publishAccountCreated(accountData: any): Promise<void>;
    publishTransactionCompleted(transactionData: any): Promise<void>;
}
