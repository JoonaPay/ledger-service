import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { Counter, Gauge, Histogram } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  constructor(
    @Inject('ledger_http_requests_total') private readonly httpRequestsCounter: Counter<string>,
    @Inject('ledger_http_request_duration_seconds') private readonly httpRequestDuration: Histogram<string>,
    @Inject('ledger_operations_total') private readonly ledgerOperationsCounter: Counter<string>,
    @Inject('ledger_account_operations_total') private readonly accountOperationsCounter: Counter<string>,
    @Inject('ledger_transactions_total') private readonly transactionCounter: Counter<string>,
    @Inject('ledger_account_balance') private readonly balanceGauge: Gauge<string>,
    @Inject('ledger_blnkfinance_health') private readonly blnkfinanceHealthGauge: Gauge<string>,
    @Inject('ledger_kafka_messages_total') private readonly kafkaMessagesCounter: Counter<string>,
    @Inject('ledger_database_connections_active') private readonly databaseConnectionsGauge: Gauge<string>,
    @Inject('ledger_cache_hit_ratio') private readonly cacheHitRatioGauge: Gauge<string>,
    @Inject('ledger_errors_total') private readonly errorRateCounter: Counter<string>,
    @Inject('ledger_business_metrics') private readonly businessMetricsGauge: Gauge<string>,
  ) {}

  onModuleInit() {
    this.initializeMetrics();
  }

  private initializeMetrics() {
    this.blnkfinanceHealthGauge.set(0);
    this.databaseConnectionsGauge.set(0);
    this.cacheHitRatioGauge.set({ cache_type: 'redis' }, 0);
  }

  recordHttpRequest(method: string, path: string, status: number, duration: number) {
    this.httpRequestsCounter.inc({ method, path, status: status.toString() });
    this.httpRequestDuration.observe({ method, path, status: status.toString() }, duration / 1000);
  }

  recordLedgerOperation(operationType: string, status: 'success' | 'failure') {
    this.ledgerOperationsCounter.inc({ operation_type: operationType, status });
  }

  recordAccountOperation(operation: string, accountType: string) {
    this.accountOperationsCounter.inc({ operation, account_type: accountType });
  }

  recordTransaction(transactionType: string, status: 'success' | 'failure' | 'pending') {
    this.transactionCounter.inc({ transaction_type: transactionType, status });
  }

  updateAccountBalance(accountId: string, accountType: string, currency: string, balance: number) {
    this.balanceGauge.set({ account_id: accountId, account_type: accountType, currency }, balance);
  }

  setBlnkFinanceHealth(isHealthy: boolean) {
    this.blnkfinanceHealthGauge.set(isHealthy ? 1 : 0);
  }

  recordKafkaMessage(topic: string, status: 'success' | 'failure') {
    this.kafkaMessagesCounter.inc({ topic, status });
  }

  setDatabaseConnections(count: number) {
    this.databaseConnectionsGauge.set(count);
  }

  setCacheHitRatio(cacheType: string, ratio: number) {
    this.cacheHitRatioGauge.set({ cache_type: cacheType }, ratio);
  }

  recordError(errorType: string, severity: 'low' | 'medium' | 'high' | 'critical') {
    this.errorRateCounter.inc({ error_type: errorType, severity });
  }

  setBusinessMetric(metricType: string, period: string, value: number) {
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

  private async getCounterValue(counter: Counter<string>): Promise<number> {
    const metric = await counter.get();
    return metric.values.reduce((sum, value) => sum + value.value, 0);
  }

  private async getGaugeValue(gauge: Gauge<string>): Promise<number> {
    const metric = await gauge.get();
    return metric.values.length > 0 ? metric.values[0].value : 0;
  }

  private async getHistogramAverage(histogram: Histogram<string>): Promise<number> {
    const metric = await histogram.get();
    const sumMetric = metric.values.find(v => v.metricName?.endsWith('_sum'));
    const countMetric = metric.values.find(v => v.metricName?.endsWith('_count'));
    
    if (sumMetric && countMetric && countMetric.value > 0) {
      return sumMetric.value / countMetric.value;
    }
    
    return 0;
  }
}