import { PrometheusController } from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';
import { Response } from 'express';
export declare class MetricsController extends PrometheusController {
    private readonly metricsService;
    constructor(metricsService: MetricsService);
    index(response: Response): Promise<string>;
    getJsonMetrics(): Promise<{
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
    getHealthMetrics(): Promise<{
        status: string;
        timestamp: string;
        healthScore: number;
        metrics: {
            uptime: number;
            memoryUsageMB: number;
            cpuUsagePercent: number;
            errorRate: number;
            blnkfinanceHealth: number;
            databaseConnections: number;
        };
        checks: {
            database: boolean;
            cache: boolean;
            blnkfinance: boolean;
            errorRate: boolean;
        };
    }>;
    private calculateHealthScore;
}
