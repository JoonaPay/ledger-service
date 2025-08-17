export declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test"
}
export declare class EnvironmentVariables {
    NODE_ENV: Environment;
    PORT: number;
    APP_NAME: string;
    DATABASE_URL: string;
    KAFKA_BROKERS: string;
    KAFKA_CLIENT_ID: string;
    KAFKA_GROUP_ID: string;
    KAFKA_SSL: boolean;
    KAFKA_SASL_MECHANISM?: string;
    KAFKA_SASL_USERNAME?: string;
    KAFKA_SASL_PASSWORD?: string;
    BLNKFINANCE_URL: string;
    BLNKFINANCE_API_KEY: string;
    BLNKFINANCE_ORGANIZATION?: string;
    BLNKFINANCE_TIMEOUT: number;
    REDIS_URL: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_PASSWORD?: string;
    REDIS_DB: number;
    THROTTLE_TTL: number;
    THROTTLE_LIMIT: number;
    METRICS_ENABLED: boolean;
}
export declare function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables;
