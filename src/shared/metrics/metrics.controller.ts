import { Controller, Get, Header, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';
import { Response } from 'express';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController extends PrometheusController {
  constructor(private readonly metricsService: MetricsService) {
    super();
  }

  @Get()
  @Header('Content-Type', 'text/plain')
  @ApiOperation({ summary: 'Get Prometheus metrics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Prometheus formatted metrics',
    content: {
      'text/plain': {
        schema: {
          type: 'string',
          example: '# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.\\n# TYPE process_cpu_user_seconds_total counter\\nprocess_cpu_user_seconds_total 0.120886'
        }
      }
    }
  })
  async index(@Res() response: Response) {
    return super.index(response);
  }

  @Get('json')
  @ApiOperation({ summary: 'Get metrics in JSON format' })
  @ApiResponse({ 
    status: 200, 
    description: 'Metrics summary in JSON format',
    schema: {
      type: 'object',
      properties: {
        http: {
          type: 'object',
          properties: {
            totalRequests: { type: 'number' },
            averageResponseTime: { type: 'number' }
          }
        },
        ledger: {
          type: 'object',
          properties: {
            totalOperations: { type: 'number' },
            totalTransactions: { type: 'number' },
            totalAccountOperations: { type: 'number' }
          }
        },
        system: {
          type: 'object',
          properties: {
            uptime: { type: 'number' },
            memoryUsageMB: { type: 'number' },
            cpuUsagePercent: { type: 'number' }
          }
        },
        blnkfinance: {
          type: 'object',
          properties: {
            health: { type: 'number' }
          }
        },
        kafka: {
          type: 'object',
          properties: {
            messagesProcessed: { type: 'number' }
          }
        },
        database: {
          type: 'object',
          properties: {
            activeConnections: { type: 'number' }
          }
        },
        cache: {
          type: 'object',
          properties: {
            hitRatio: { type: 'number' }
          }
        },
        errors: {
          type: 'object',
          properties: {
            totalErrors: { type: 'number' }
          }
        }
      }
    }
  })
  async getJsonMetrics() {
    return this.metricsService.getMetricsSummary();
  }

  @Get('health')
  @ApiOperation({ summary: 'Get service health metrics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Health status with metrics',
  })
  async getHealthMetrics() {
    const metrics = await this.metricsService.getMetricsSummary();
    const isHealthy = this.calculateHealthScore(metrics) > 70;
    
    return {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      healthScore: this.calculateHealthScore(metrics),
      metrics: {
        uptime: metrics.system.uptime,
        memoryUsageMB: metrics.system.memoryUsageMB,
        cpuUsagePercent: metrics.system.cpuUsagePercent,
        errorRate: metrics.errors.totalErrors,
        blnkfinanceHealth: metrics.blnkfinance.health,
        databaseConnections: metrics.database.activeConnections,
      },
      checks: {
        database: metrics.database.activeConnections >= 0,
        cache: metrics.cache.hitRatio >= 0,
        blnkfinance: metrics.blnkfinance.health === 1,
        errorRate: metrics.errors.totalErrors < 100,
      }
    };
  }

  private calculateHealthScore(metrics: any): number {
    let score = 100;
    
    if (metrics.errors.totalErrors > 0) {
      score -= Math.min(30, metrics.errors.totalErrors / 10);
    }
    
    if (metrics.blnkfinance.health === 0) {
      score -= 25;
    }
    
    if (metrics.database.activeConnections === 0) {
      score -= 20;
    }
    
    if (metrics.system.memoryUsageMB > 512) {
      score -= 10;
    }
    
    if (metrics.system.cpuUsagePercent > 80) {
      score -= 15;
    }
    
    return Math.max(0, Math.min(100, score));
  }
}