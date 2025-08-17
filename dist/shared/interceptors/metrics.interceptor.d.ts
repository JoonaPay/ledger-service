import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MetricsService } from '@shared/metrics/metrics.service';
export declare class MetricsInterceptor implements NestInterceptor {
    private readonly metricsService;
    constructor(metricsService: MetricsService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private recordMetrics;
    private normalizePath;
    private getErrorSeverity;
}
