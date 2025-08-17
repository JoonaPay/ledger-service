"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessMetricsGauge = exports.errorRateCounter = exports.cacheHitRatioGauge = exports.databaseConnectionsGauge = exports.kafkaMessagesCounter = exports.blnkfinanceHealthGauge = exports.balanceGauge = exports.transactionCounter = exports.accountOperationsCounter = exports.ledgerOperationsCounter = exports.httpRequestDuration = exports.httpRequestsCounter = void 0;
const nestjs_prometheus_1 = require("@willsoto/nestjs-prometheus");
exports.httpRequestsCounter = (0, nestjs_prometheus_1.makeCounterProvider)({
    name: 'ledger_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status'],
});
exports.httpRequestDuration = (0, nestjs_prometheus_1.makeHistogramProvider)({
    name: 'ledger_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'path', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
});
exports.ledgerOperationsCounter = (0, nestjs_prometheus_1.makeCounterProvider)({
    name: 'ledger_operations_total',
    help: 'Total number of ledger operations',
    labelNames: ['operation_type', 'status'],
});
exports.accountOperationsCounter = (0, nestjs_prometheus_1.makeCounterProvider)({
    name: 'ledger_account_operations_total',
    help: 'Total number of account operations',
    labelNames: ['operation', 'account_type'],
});
exports.transactionCounter = (0, nestjs_prometheus_1.makeCounterProvider)({
    name: 'ledger_transactions_total',
    help: 'Total number of transactions processed',
    labelNames: ['transaction_type', 'status'],
});
exports.balanceGauge = (0, nestjs_prometheus_1.makeGaugeProvider)({
    name: 'ledger_account_balance',
    help: 'Current account balances',
    labelNames: ['account_id', 'account_type', 'currency'],
});
exports.blnkfinanceHealthGauge = (0, nestjs_prometheus_1.makeGaugeProvider)({
    name: 'ledger_blnkfinance_health',
    help: 'BlnkFinance service health status (1 = healthy, 0 = unhealthy)',
});
exports.kafkaMessagesCounter = (0, nestjs_prometheus_1.makeCounterProvider)({
    name: 'ledger_kafka_messages_total',
    help: 'Total number of Kafka messages processed',
    labelNames: ['topic', 'status'],
});
exports.databaseConnectionsGauge = (0, nestjs_prometheus_1.makeGaugeProvider)({
    name: 'ledger_database_connections_active',
    help: 'Number of active database connections',
});
exports.cacheHitRatioGauge = (0, nestjs_prometheus_1.makeGaugeProvider)({
    name: 'ledger_cache_hit_ratio',
    help: 'Cache hit ratio (0-1)',
    labelNames: ['cache_type'],
});
exports.errorRateCounter = (0, nestjs_prometheus_1.makeCounterProvider)({
    name: 'ledger_errors_total',
    help: 'Total number of errors',
    labelNames: ['error_type', 'severity'],
});
exports.businessMetricsGauge = (0, nestjs_prometheus_1.makeGaugeProvider)({
    name: 'ledger_business_metrics',
    help: 'Business-specific metrics',
    labelNames: ['metric_type', 'period'],
});
//# sourceMappingURL=metrics.definitions.js.map