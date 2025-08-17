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
var KafkaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaService = exports.KAFKA_TOPICS = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const metrics_service_1 = require("../metrics/metrics.service");
const kafkajs_1 = require("kafkajs");
exports.KAFKA_TOPICS = {
    IDENTITY_EVENTS: 'identity.events',
    LEDGER_EVENTS: 'ledger.events',
    USER_CREATED: 'user.created',
    USER_UPDATED: 'user.updated',
    USER_DELETED: 'user.deleted',
    ACCOUNT_CREATED: 'account.created',
    TRANSACTION_COMPLETED: 'transaction.completed',
};
let KafkaService = KafkaService_1 = class KafkaService {
    constructor(configService, eventEmitter, metricsService) {
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.metricsService = metricsService;
        this.logger = new common_1.Logger(KafkaService_1.name);
        this.brokers = this.configService.get('kafka.brokers', ['localhost:9092']);
        this.clientId = this.configService.get('kafka.clientId', 'ledger-service');
        this.groupId = this.configService.get('kafka.groupId', 'ledger-service-group');
        this.kafka = new kafkajs_1.Kafka({
            clientId: this.clientId,
            brokers: this.brokers,
            ssl: this.configService.get('kafka.ssl', false),
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
        }
        catch (error) {
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
        }
        catch (error) {
            this.logger.error('❌ Error shutting down Kafka service', error);
        }
    }
    async subscribeToTopics() {
        const topics = {
            topics: [
                exports.KAFKA_TOPICS.IDENTITY_EVENTS,
                exports.KAFKA_TOPICS.USER_CREATED,
                exports.KAFKA_TOPICS.USER_UPDATED,
                exports.KAFKA_TOPICS.USER_DELETED,
            ],
            fromBeginning: false,
        };
        await this.consumer.subscribe(topics);
        this.logger.log(`📨 Subscribed to topics: ${topics.topics.join(', ')}`);
    }
    async startConsuming() {
        const config = {
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    await this.handleMessage(topic, partition, message);
                    this.metricsService.recordKafkaMessage(topic, 'success');
                }
                catch (error) {
                    this.logger.error(`Error processing message from topic ${topic}:`, error);
                    this.metricsService.recordKafkaMessage(topic, 'failure');
                    this.metricsService.recordError('kafka_message_processing', 'high');
                }
            },
        };
        await this.consumer.run(config);
        this.logger.log('🚀 Started consuming Kafka messages');
    }
    async handleMessage(topic, partition, message) {
        const messageValue = message.value?.toString();
        if (!messageValue) {
            this.logger.warn(`Empty message received from topic ${topic}`);
            return;
        }
        try {
            const parsedMessage = JSON.parse(messageValue);
            this.logger.log(`📨 Received message from topic ${topic}:`, parsedMessage);
            switch (topic) {
                case exports.KAFKA_TOPICS.IDENTITY_EVENTS:
                    await this.handleIdentityEvent(parsedMessage);
                    break;
                case exports.KAFKA_TOPICS.USER_CREATED:
                    await this.handleUserCreated(parsedMessage);
                    break;
                case exports.KAFKA_TOPICS.USER_UPDATED:
                    await this.handleUserUpdated(parsedMessage);
                    break;
                case exports.KAFKA_TOPICS.USER_DELETED:
                    await this.handleUserDeleted(parsedMessage);
                    break;
                default:
                    this.logger.warn(`Unhandled topic: ${topic}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to parse message from topic ${topic}:`, error);
            throw error;
        }
    }
    async handleIdentityEvent(event) {
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
    async handleUserCreated(userData) {
        this.logger.log('Processing user created event:', userData);
        this.eventEmitter.emit('identity.user.created', userData);
    }
    async handleUserUpdated(userData) {
        this.logger.log('Processing user updated event:', userData);
        this.eventEmitter.emit('identity.user.updated', userData);
    }
    async handleUserDeleted(userData) {
        this.logger.log('Processing user deleted event:', userData);
        this.eventEmitter.emit('identity.user.deleted', userData);
    }
    async publishEvent(topic, event, key) {
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
        }
        catch (error) {
            this.logger.error(`Failed to publish event to topic ${topic}:`, error);
            this.metricsService.recordKafkaMessage(topic, 'failure');
            this.metricsService.recordError('kafka_publish', 'high');
            throw error;
        }
    }
    async publishLedgerEvent(eventType, data) {
        const event = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: eventType,
            data,
            timestamp: new Date().toISOString(),
            service: 'ledger-service',
        };
        await this.publishEvent(exports.KAFKA_TOPICS.LEDGER_EVENTS, event);
    }
    async publishAccountCreated(accountData) {
        await this.publishEvent(exports.KAFKA_TOPICS.ACCOUNT_CREATED, {
            ...accountData,
            timestamp: new Date().toISOString(),
        });
    }
    async publishTransactionCompleted(transactionData) {
        await this.publishEvent(exports.KAFKA_TOPICS.TRANSACTION_COMPLETED, {
            ...transactionData,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.KafkaService = KafkaService;
exports.KafkaService = KafkaService = KafkaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        event_emitter_1.EventEmitter2,
        metrics_service_1.MetricsService])
], KafkaService);
//# sourceMappingURL=kafka.service.js.map