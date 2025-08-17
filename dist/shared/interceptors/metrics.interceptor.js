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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const metrics_service_1 = require("../metrics/metrics.service");
let MetricsInterceptor = class MetricsInterceptor {
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const startTime = Date.now();
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                this.recordMetrics(request, response, startTime);
            },
            error: (error) => {
                this.recordMetrics(request, response, startTime);
                this.metricsService.recordError(error.constructor.name, this.getErrorSeverity(response.statusCode));
            },
        }));
    }
    recordMetrics(request, response, startTime) {
        const duration = Date.now() - startTime;
        const method = request.method;
        const path = this.normalizePath(request.route?.path || request.url);
        const status = response.statusCode;
        this.metricsService.recordHttpRequest(method, path, status, duration);
    }
    normalizePath(path) {
        return path
            .replace(/\/\d+/g, '/:id')
            .replace(/\/[a-f0-9-]{36}/g, '/:uuid')
            .replace(/\/[a-f0-9]{24}/g, '/:objectId');
    }
    getErrorSeverity(statusCode) {
        if (statusCode >= 500)
            return 'critical';
        if (statusCode >= 400)
            return 'high';
        if (statusCode >= 300)
            return 'medium';
        return 'low';
    }
};
exports.MetricsInterceptor = MetricsInterceptor;
exports.MetricsInterceptor = MetricsInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], MetricsInterceptor);
//# sourceMappingURL=metrics.interceptor.js.map