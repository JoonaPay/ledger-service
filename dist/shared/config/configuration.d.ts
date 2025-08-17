declare const _default: () => {
    port: number;
    nodeEnv: string;
    appName: string;
    database: {
        url: string;
        type: string;
        synchronize: boolean;
        logging: boolean;
    };
    kafka: {
        brokers: string[];
        clientId: string;
        groupId: string;
        ssl: boolean;
        sasl: {
            mechanism: any;
            username: string;
            password: string;
        };
    };
    blnkfinance: {
        url: string;
        apiKey: string;
        organization: string;
        timeout: number;
    };
    redis: {
        url: string;
        host: string;
        port: number;
        password: string;
        db: number;
    };
    throttle: {
        ttl: number;
        limit: number;
    };
    swagger: {
        title: string;
        description: string;
        version: string;
        tag: string;
    };
    metrics: {
        enabled: boolean;
        prefix: string;
    };
};
export default _default;
