import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MetricsService } from '@shared/metrics/metrics.service';
import { Kafka, Consumer, Producer, KafkaMessage, ConsumerSubscribeTopics, ConsumerRunConfig } from 'kafkajs';

export interface KafkaTopics {
  IDENTITY_EVENTS: 'identity.events';
  LEDGER_EVENTS: 'ledger.events';
  USER_CREATED: 'user.created';
  USER_UPDATED: 'user.updated';
  USER_DELETED: 'user.deleted';
  ACCOUNT_CREATED: 'account.created';
  TRANSACTION_COMPLETED: 'transaction.completed';
}

export const KAFKA_TOPICS: KafkaTopics = {
  IDENTITY_EVENTS: 'identity.events',
  LEDGER_EVENTS: 'ledger.events',
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  ACCOUNT_CREATED: 'account.created',
  TRANSACTION_COMPLETED: 'transaction.completed',
};

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private consumer: Consumer;
  private producer: Producer;
  private readonly brokers: string[];
  private readonly clientId: string;
  private readonly groupId: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly metricsService: MetricsService,
  ) {
    this.brokers = this.configService.get<string[]>('kafka.brokers', ['localhost:9092']);
    this.clientId = this.configService.get<string>('kafka.clientId', 'ledger-service');
    this.groupId = this.configService.get<string>('kafka.groupId', 'ledger-service-group');

    this.kafka = new Kafka({
      clientId: this.clientId,
      brokers: this.brokers,
      ssl: this.configService.get<boolean>('kafka.ssl', false),
      sasl: this.configService.get('kafka.sasl'),
    });

    this.consumer = this.kafka.consumer({ groupId: this.groupId });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      this.logger.log('Initializing Kafka service...');
      
      await this.producer.connect();
      await this.consumer.connect();
      
      await this.subscribeToTopics();
      await this.startConsuming();
      
      this.logger.log('✅ Kafka service initialized successfully');
      
    } catch (error) {
      this.logger.error('❌ Failed to initialize Kafka service', error);
      this.metricsService.recordError('kafka_init', 'critical');
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      this.logger.log('Shutting down Kafka service...');
      
      await this.consumer.disconnect();
      await this.producer.disconnect();
      
      this.logger.log('✅ Kafka service shut down successfully');
      
    } catch (error) {
      this.logger.error('❌ Error shutting down Kafka service', error);
    }
  }

  private async subscribeToTopics() {
    const topics: ConsumerSubscribeTopics = {
      topics: [
        KAFKA_TOPICS.IDENTITY_EVENTS,
        KAFKA_TOPICS.USER_CREATED,
        KAFKA_TOPICS.USER_UPDATED,
        KAFKA_TOPICS.USER_DELETED,
      ],
      fromBeginning: false,
    };

    await this.consumer.subscribe(topics);
    this.logger.log(`📨 Subscribed to topics: ${topics.topics.join(', ')}`);
  }

  private async startConsuming() {
    const config: ConsumerRunConfig = {
      eachMessage: async ({ topic, partition, message }) => {
        try {
          await this.handleMessage(topic, partition, message);
          this.metricsService.recordKafkaMessage(topic, 'success');
          
        } catch (error) {
          this.logger.error(`Error processing message from topic ${topic}:`, error);
          this.metricsService.recordKafkaMessage(topic, 'failure');
          this.metricsService.recordError('kafka_message_processing', 'high');
        }
      },
    };

    await this.consumer.run(config);
    this.logger.log('🚀 Started consuming Kafka messages');
  }

  private async handleMessage(topic: string, partition: number, message: KafkaMessage) {
    const messageValue = message.value?.toString();
    if (!messageValue) {
      this.logger.warn(`Empty message received from topic ${topic}`);
      return;
    }

    try {
      const parsedMessage = JSON.parse(messageValue);
      this.logger.log(`📨 Received message from topic ${topic}:`, parsedMessage);

      switch (topic) {
        case KAFKA_TOPICS.IDENTITY_EVENTS:
          await this.handleIdentityEvent(parsedMessage);
          break;
        case KAFKA_TOPICS.USER_CREATED:
          await this.handleUserCreated(parsedMessage);
          break;
        case KAFKA_TOPICS.USER_UPDATED:
          await this.handleUserUpdated(parsedMessage);
          break;
        case KAFKA_TOPICS.USER_DELETED:
          await this.handleUserDeleted(parsedMessage);
          break;
        default:
          this.logger.warn(`Unhandled topic: ${topic}`);
      }

    } catch (error) {
      this.logger.error(`Failed to parse message from topic ${topic}:`, error);
      throw error;
    }
  }

  private async handleIdentityEvent(event: any) {
    this.logger.log('Processing identity event:', event);
    
    switch (event.type) {
      case 'user.created':
        this.eventEmitter.emit('identity.user.created', event.data);
        break;
      case 'user.updated':
        this.eventEmitter.emit('identity.user.updated', event.data);
        break;
      case 'user.deleted':
        this.eventEmitter.emit('identity.user.deleted', event.data);
        break;
      default:
        this.logger.warn(`Unhandled identity event type: ${event.type}`);
    }
  }

  private async handleUserCreated(userData: any) {
    this.logger.log('Processing user created event:', userData);
    this.eventEmitter.emit('identity.user.created', userData);
  }

  private async handleUserUpdated(userData: any) {
    this.logger.log('Processing user updated event:', userData);
    this.eventEmitter.emit('identity.user.updated', userData);
  }

  private async handleUserDeleted(userData: any) {
    this.logger.log('Processing user deleted event:', userData);
    this.eventEmitter.emit('identity.user.deleted', userData);
  }

  async publishEvent(topic: string, event: any, key?: string): Promise<void> {
    try {
      const message = {
        key: key || event.id || Date.now().toString(),
        value: JSON.stringify(event),
        timestamp: Date.now().toString(),
      };

      await this.producer.send({
        topic,
        messages: [message],
      });

      this.logger.log(`📤 Published event to topic ${topic}:`, event);
      this.metricsService.recordKafkaMessage(topic, 'success');

    } catch (error) {
      this.logger.error(`Failed to publish event to topic ${topic}:`, error);
      this.metricsService.recordKafkaMessage(topic, 'failure');
      this.metricsService.recordError('kafka_publish', 'high');
      throw error;
    }
  }

  async publishLedgerEvent(eventType: string, data: any): Promise<void> {
    const event = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
      service: 'ledger-service',
    };

    await this.publishEvent(KAFKA_TOPICS.LEDGER_EVENTS, event);
  }

  async publishAccountCreated(accountData: any): Promise<void> {
    await this.publishEvent(KAFKA_TOPICS.ACCOUNT_CREATED, {
      ...accountData,
      timestamp: new Date().toISOString(),
    });
  }

  async publishTransactionCompleted(transactionData: any): Promise<void> {
    await this.publishEvent(KAFKA_TOPICS.TRANSACTION_COMPLETED, {
      ...transactionData,
      timestamp: new Date().toISOString(),
    });
  }
}