import { makeCounterProvider, makeGaugeProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

export const httpRequestsCounter = makeCounterProvider({
  name: 'ledger_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
});

export const httpRequestDuration = makeHistogramProvider({
  name: 'ledger_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

export const ledgerOperationsCounter = makeCounterProvider({
  name: 'ledger_operations_total',
  help: 'Total number of ledger operations',
  labelNames: ['operation_type', 'status'],
});

export const accountOperationsCounter = makeCounterProvider({
  name: 'ledger_account_operations_total',
  help: 'Total number of account operations',
  labelNames: ['operation', 'account_type'],
});

export const transactionCounter = makeCounterProvider({
  name: 'ledger_transactions_total',
  help: 'Total number of transactions processed',
  labelNames: ['transaction_type', 'status'],
});

export const balanceGauge = makeGaugeProvider({
  name: 'ledger_account_balance',
  help: 'Current account balances',
  labelNames: ['account_id', 'account_type', 'currency'],
});

export const blnkfinanceHealthGauge = makeGaugeProvider({
  name: 'ledger_blnkfinance_health',
  help: 'BlnkFinance service health status (1 = healthy, 0 = unhealthy)',
});

export const kafkaMessagesCounter = makeCounterProvider({
  name: 'ledger_kafka_messages_total',
  help: 'Total number of Kafka messages processed',
  labelNames: ['topic', 'status'],
});

export const databaseConnectionsGauge = makeGaugeProvider({
  name: 'ledger_database_connections_active',
  help: 'Number of active database connections',
});

export const cacheHitRatioGauge = makeGaugeProvider({
  name: 'ledger_cache_hit_ratio',
  help: 'Cache hit ratio (0-1)',
  labelNames: ['cache_type'],
});

export const errorRateCounter = makeCounterProvider({
  name: 'ledger_errors_total',
  help: 'Total number of errors',
  labelNames: ['error_type', 'severity'],
});

export const businessMetricsGauge = makeGaugeProvider({
  name: 'ledger_business_metrics',
  help: 'Business-specific metrics',
  labelNames: ['metric_type', 'period'],
});