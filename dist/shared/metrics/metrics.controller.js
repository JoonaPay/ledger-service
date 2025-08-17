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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nestjs_prometheus_1 = require("@willsoto/nestjs-prometheus");
const metrics_service_1 = require("./metrics.service");
let MetricsController = class MetricsController extends nestjs_prometheus_1.PrometheusController {
    constructor(metricsService) {
        super();
        this.metricsService = metricsService;
    }
    async index(response) {
        return super.index(response);
    }
    async getJsonMetrics() {
        return this.metricsService.getMetricsSummary();
    }
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
    calculateHealthScore(metrics) {
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
};
exports.MetricsController = MetricsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.Header)('Content-Type', 'text/plain'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Prometheus metrics' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "index", null);
__decorate([
    (0, common_1.Get)('json'),
    (0, swagger_1.ApiOperation)({ summary: 'Get metrics in JSON format' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getJsonMetrics", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get service health metrics' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Health status with metrics',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getHealthMetrics", null);
exports.MetricsController = MetricsController = __decorate([
    (0, swagger_1.ApiTags)('Metrics'),
    (0, common_1.Controller)('metrics'),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], MetricsController);
//# sourceMappingURL=metrics.controller.js.map