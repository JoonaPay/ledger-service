import { LedgerService } from '../domain/services/ledger.service';
import { KafkaService } from '@shared/kafka/kafka.service';
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
export declare class IdentityEventHandler {
    private readonly ledgerService;
    private readonly kafkaService;
    private readonly metricsService;
    private readonly logger;
    constructor(ledgerService: LedgerService, kafkaService: KafkaService, metricsService: MetricsService);
    handleUserCreated(event: IdentityUserCreatedEvent): Promise<void>;
    handleUserUpdated(event: IdentityUserUpdatedEvent): Promise<void>;
    handleUserDeleted(event: IdentityUserDeletedEvent): Promise<void>;
}
