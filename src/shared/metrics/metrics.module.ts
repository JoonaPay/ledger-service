import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { 
  httpRequestsCounter,
  httpRequestDuration,
  ledgerOperationsCounter,
  accountOperationsCounter,
  transactionCounter,
  balanceGauge,
  blnkfinanceHealthGauge,
  kafkaMessagesCounter,
  databaseConnectionsGauge,
  cacheHitRatioGauge,
  errorRateCounter,
  businessMetricsGauge
} from './metrics.definitions';

@Module({
  imports: [
    PrometheusModule.register({
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
    MetricsService,
    httpRequestsCounter,
    httpRequestDuration,
    ledgerOperationsCounter,
    accountOperationsCounter,
    transactionCounter,
    balanceGauge,
    blnkfinanceHealthGauge,
    kafkaMessagesCounter,
    databaseConnectionsGauge,
    cacheHitRatioGauge,
    errorRateCounter,
    businessMetricsGauge,
  ],
  controllers: [MetricsController],
  exports: [MetricsService, PrometheusModule],
})
export class MetricsModule {}