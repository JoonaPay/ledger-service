"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_prometheus_1 = require("@willsoto/nestjs-prometheus");
const metrics_service_1 = require("./metrics.service");
const metrics_controller_1 = require("./metrics.controller");
const metrics_definitions_1 = require("./metrics.definitions");
let MetricsModule = class MetricsModule {
};
exports.MetricsModule = MetricsModule;
exports.MetricsModule = MetricsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_prometheus_1.PrometheusModule.register({
                defaultMetrics: {
                    enabled: true,
                    config: {
                        prefix: 'ledger_service_',
                    },
                },
                defaultLabels: {
                    app: 'ledger-service',
                    version: '1.0.0',
                },
            }),
        ],
        providers: [
            metrics_service_1.MetricsService,
            metrics_definitions_1.httpRequestsCounter,
            metrics_definitions_1.httpRequestDuration,
            metrics_definitions_1.ledgerOperationsCounter,
            metrics_definitions_1.accountOperationsCounter,
            metrics_definitions_1.transactionCounter,
            metrics_definitions_1.balanceGauge,
            metrics_definitions_1.blnkfinanceHealthGauge,
            metrics_definitions_1.kafkaMessagesCounter,
            metrics_definitions_1.databaseConnectionsGauge,
            metrics_definitions_1.cacheHitRatioGauge,
            metrics_definitions_1.errorRateCounter,
            metrics_definitions_1.businessMetricsGauge,
        ],
        controllers: [metrics_controller_1.MetricsController],
        exports: [metrics_service_1.MetricsService, nestjs_prometheus_1.PrometheusModule],
    })
], MetricsModule);
//# sourceMappingURL=metrics.module.js.map