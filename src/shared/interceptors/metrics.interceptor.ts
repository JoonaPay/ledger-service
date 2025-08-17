import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '@shared/metrics/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.recordMetrics(request, response, startTime);
        },
        error: (error) => {
          this.recordMetrics(request, response, startTime);
          this.metricsService.recordError(
            error.constructor.name,
            this.getErrorSeverity(response.statusCode)
          );
        },
      }),
    );
  }

  private recordMetrics(request: any, response: any, startTime: number) {
    const duration = Date.now() - startTime;
    const method = request.method;
    const path = this.normalizePath(request.route?.path || request.url);
    const status = response.statusCode;

    this.metricsService.recordHttpRequest(method, path, status, duration);
  }

  private normalizePath(path: string): string {
    return path
      .replace(/\/\d+/g, '/:id')
      .replace(/\/[a-f0-9-]{36}/g, '/:uuid')
      .replace(/\/[a-f0-9]{24}/g, '/:objectId');
  }

  private getErrorSeverity(statusCode: number): 'low' | 'medium' | 'high' | 'critical' {
    if (statusCode >= 500) return 'critical';
    if (statusCode >= 400) return 'high';
    if (statusCode >= 300) return 'medium';
    return 'low';
  }
}