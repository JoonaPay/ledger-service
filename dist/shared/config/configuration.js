"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT, 10) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    appName: process.env.APP_NAME || 'JoonaPay Ledger Service',
    database: {
        url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/JoonaPay_Ledger_db',
        type: 'postgres',
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
    },
    kafka: {
        brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
        clientId: process.env.KAFKA_CLIENT_ID || 'ledger-service',
        groupId: process.env.KAFKA_GROUP_ID || 'ledger-service-group',
        ssl: process.env.KAFKA_SSL === 'true',
        sasl: process.env.KAFKA_SASL_MECHANISM ? {
            mechanism: process.env.KAFKA_SASL_MECHANISM,
            username: process.env.KAFKA_SASL_USERNAME,
            password: process.env.KAFKA_SASL_PASSWORD,
        } : undefined,
    },
    blnkfinance: {
        url: process.env.BLNKFINANCE_URL || 'https://api.blnkfinance.com',
        apiKey: process.env.BLNKFINANCE_API_KEY,
        organization: process.env.BLNKFINANCE_ORGANIZATION,
        timeout: parseInt(process.env.BLNKFINANCE_TIMEOUT, 10) || 30000,
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB, 10) || 0,
    },
    throttle: {
        ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
        limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
    },
    swagger: {
        title: 'JoonaPay Ledger Service API',
        description: 'Core accounting and financial ledger management service',
        version: '1.0.0',
        tag: 'ledger',
    },
    metrics: {
        enabled: process.env.METRICS_ENABLED !== 'false',
        prefix: 'ledger_service_',
    },
});
//# sourceMappingURL=configuration.js.map