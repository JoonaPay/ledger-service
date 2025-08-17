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
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const prom_client_1 = require("prom-client");
let MetricsService = class MetricsService {
    constructor(httpRequestsCounter, httpRequestDuration, ledgerOperationsCounter, accountOperationsCounter, transactionCounter, balanceGauge, blnkfinanceHealthGauge, kafkaMessagesCounter, databaseConnectionsGauge, cacheHitRatioGauge, errorRateCounter, businessMetricsGauge) {
        this.httpRequestsCounter = httpRequestsCounter;
        this.httpRequestDuration = httpRequestDuration;
        this.ledgerOperationsCounter = ledgerOperationsCounter;
        this.accountOperationsCounter = accountOperationsCounter;
        this.transactionCounter = transactionCounter;
        this.balanceGauge = balanceGauge;
        this.blnkfinanceHealthGauge = blnkfinanceHealthGauge;
        this.kafkaMessagesCounter = kafkaMessagesCounter;
        this.databaseConnectionsGauge = databaseConnectionsGauge;
        this.cacheHitRatioGauge = cacheHitRatioGauge;
        this.errorRateCounter = errorRateCounter;
        this.businessMetricsGauge = businessMetricsGauge;
    }
    onModuleInit() {
        this.initializeMetrics();
    }
    initializeMetrics() {
        this.blnkfinanceHealthGauge.set(0);
        this.databaseConnectionsGauge.set(0);
        this.cacheHitRatioGauge.set({ cache_type: 'redis' }, 0);
    }
    recordHttpRequest(method, path, status, duration) {
        this.httpRequestsCounter.inc({ method, path, status: status.toString() });
        this.httpRequestDuration.observe({ method, path, status: status.toString() }, duration / 1000);
    }
    recordLedgerOperation(operationType, status) {
        this.ledgerOperationsCounter.inc({ operation_type: operationType, status });
    }
    recordAccountOperation(operation, accountType) {
        this.accountOperationsCounter.inc({ operation, account_type: accountType });
    }
    recordTransaction(transactionType, status) {
        this.transactionCounter.inc({ transaction_type: transactionType, status });
    }
    updateAccountBalance(accountId, accountType, currency, balance) {
        this.balanceGauge.set({ account_id: accountId, account_type: accountType, currency }, balance);
    }
    setBlnkFinanceHealth(isHealthy) {
        this.blnkfinanceHealthGauge.set(isHealthy ? 1 : 0);
    }
    recordKafkaMessage(topic, status) {
        this.kafkaMessagesCounter.inc({ topic, status });
    }
    setDatabaseConnections(count) {
        this.databaseConnectionsGauge.set(count);
    }
    setCacheHitRatio(cacheType, ratio) {
        this.cacheHitRatioGauge.set({ cache_type: cacheType }, ratio);
    }
    recordError(errorType, severity) {
        this.errorRateCounter.inc({ error_type: errorType, severity });
    }
    setBusinessMetric(metricType, period, value) {
        this.businessMetricsGauge.set({ metric_type: metricType, period }, value);
    }
    async getMetricsSummary() {
        return {
            http: {
                totalRequests: await this.getCounterValue(this.httpRequestsCounter),
                averageResponseTime: await this.getHistogramAverage(this.httpRequestDuration),
            },
            ledger: {
                totalOperations: await this.getCounterValue(this.ledgerOperationsCounter),
                totalTransactions: await this.getCounterValue(this.transactionCounter),
                totalAccountOperations: await this.getCounterValue(this.accountOperationsCounter),
            },
            system: {
                uptime: Math.floor(process.uptime()),
                memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
                cpuUsagePercent: Math.round(process.cpuUsage().user / 1000),
            },
            blnkfinance: {
                health: await this.getGaugeValue(this.blnkfinanceHealthGauge),
            },
            kafka: {
                messagesProcessed: await this.getCounterValue(this.kafkaMessagesCounter),
            },
            database: {
                activeConnections: await this.getGaugeValue(this.databaseConnectionsGauge),
            },
            cache: {
                hitRatio: await this.getGaugeValue(this.cacheHitRatioGauge),
            },
            errors: {
                totalErrors: await this.getCounterValue(this.errorRateCounter),
            },
        };
    }
    async getCounterValue(counter) {
        const metric = await counter.get();
        return metric.values.reduce((sum, value) => sum + value.value, 0);
    }
    async getGaugeValue(gauge) {
        const metric = await gauge.get();
        return metric.values.length > 0 ? metric.values[0].value : 0;
    }
    async getHistogramAverage(histogram) {
        const metric = await histogram.get();
        const sumMetric = metric.values.find(v => v.metricName?.endsWith('_sum'));
        const countMetric = metric.values.find(v => v.metricName?.endsWith('_count'));
        if (sumMetric && countMetric && countMetric.value > 0) {
            return sumMetric.value / countMetric.value;
        }
        return 0;
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ledger_http_requests_total')),
    __param(1, (0, common_1.Inject)('ledger_http_request_duration_seconds')),
    __param(2, (0, common_1.Inject)('ledger_operations_total')),
    __param(3, (0, common_1.Inject)('ledger_account_operations_total')),
    __param(4, (0, common_1.Inject)('ledger_transactions_total')),
    __param(5, (0, common_1.Inject)('ledger_account_balance')),
    __param(6, (0, common_1.Inject)('ledger_blnkfinance_health')),
    __param(7, (0, common_1.Inject)('ledger_kafka_messages_total')),
    __param(8, (0, common_1.Inject)('ledger_database_connections_active')),
    __param(9, (0, common_1.Inject)('ledger_cache_hit_ratio')),
    __param(10, (0, common_1.Inject)('ledger_errors_total')),
    __param(11, (0, common_1.Inject)('ledger_business_metrics')),
    __metadata("design:paramtypes", [prom_client_1.Counter,
        prom_client_1.Histogram,
        prom_client_1.Counter,
        prom_client_1.Counter,
        prom_client_1.Counter,
        prom_client_1.Gauge,
        prom_client_1.Gauge,
        prom_client_1.Counter,
        prom_client_1.Gauge,
        prom_client_1.Gauge,
        prom_client_1.Counter,
        prom_client_1.Gauge])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map