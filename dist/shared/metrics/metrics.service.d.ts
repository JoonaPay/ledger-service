import { OnModuleInit } from '@nestjs/common';
import { Counter, Gauge, Histogram } from 'prom-client';
export declare class MetricsService implements OnModuleInit {
    private readonly httpRequestsCounter;
    private readonly httpRequestDuration;
    private readonly ledgerOperationsCounter;
    private readonly accountOperationsCounter;
    private readonly transactionCounter;
    private readonly balanceGauge;
    private readonly blnkfinanceHealthGauge;
    private readonly kafkaMessagesCounter;
    private readonly databaseConnectionsGauge;
    private readonly cacheHitRatioGauge;
    private readonly errorRateCounter;
    private readonly businessMetricsGauge;
    constructor(httpRequestsCounter: Counter<string>, httpRequestDuration: Histogram<string>, ledgerOperationsCounter: Counter<string>, accountOperationsCounter: Counter<string>, transactionCounter: Counter<string>, balanceGauge: Gauge<string>, blnkfinanceHealthGauge: Gauge<string>, kafkaMessagesCounter: Counter<string>, databaseConnectionsGauge: Gauge<string>, cacheHitRatioGauge: Gauge<string>, errorRateCounter: Counter<string>, businessMetricsGauge: Gauge<string>);
    onModuleInit(): void;
    private initializeMetrics;
    recordHttpRequest(method: string, path: string, status: number, duration: number): void;
    recordLedgerOperation(operationType: string, status: 'success' | 'failure'): void;
    recordAccountOperation(operation: string, accountType: string): void;
    recordTransaction(transactionType: string, status: 'success' | 'failure' | 'pending'): void;
    updateAccountBalance(accountId: string, accountType: string, currency: string, balance: number): void;
    setBlnkFinanceHealth(isHealthy: boolean): void;
    recordKafkaMessage(topic: string, status: 'success' | 'failure'): void;
    setDatabaseConnections(count: number): void;
    setCacheHitRatio(cacheType: string, ratio: number): void;
    recordError(errorType: string, severity: 'low' | 'medium' | 'high' | 'critical'): void;
    setBusinessMetric(metricType: string, period: string, value: number): void;
    getMetricsSummary(): Promise<{
        http: {
            totalRequests: number;
            averageResponseTime: number;
        };
        ledger: {
            totalOperations: number;
            totalTransactions: number;
            totalAccountOperations: number;
        };
        system: {
            uptime: number;
            memoryUsageMB: number;
            cpuUsagePercent: number;
        };
        blnkfinance: {
            health: number;
        };
        kafka: {
            messagesProcessed: number;
        };
        database: {
            activeConnections: number;
        };
        cache: {
            hitRatio: number;
        };
        errors: {
            totalErrors: number;
        };
    }>;
    private getCounterValue;
    private getGaugeValue;
    private getHistogramAverage;
}
