import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LedgerModule } from './modules/ledger/ledger.module';
import configuration from './shared/config/configuration';

// DDD Modules
import { TransactionModule } from './modules/transaction/transaction.module';
import { AccountModule } from './modules/account/account.module';
import { TransactionEntryModule } from './modules/transaction-entry/transaction-entry.module';

// ORM Entities from DDD modules
import { OrmEntities as TransactionOrmEntities } from './modules/transaction/infrastructure/orm-entities';
import { OrmEntities as AccountOrmEntities } from './modules/account/infrastructure/orm-entities';
import { OrmEntities as TransactionEntryOrmEntities } from './modules/transaction-entry/infrastructure/orm-entities';
import { validateEnvironment } from './shared/config/env.validation';
import { MetricsModule } from './shared/metrics/metrics.module';
import { MetricsInterceptor } from './shared/interceptors/metrics.interceptor';
import { KafkaModule } from './shared/kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
      cache: true,
      expandVariables: true,
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('database.url'),
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
        entities: [
          ...TransactionOrmEntities,
          ...AccountOrmEntities,
          ...TransactionEntryOrmEntities,
          __dirname + '/**/*.orm-entity{.ts,.js}'
        ],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        autoLoadEntities: true,
        retryAttempts: 3,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [{
          ttl: configService.get<number>('throttle.ttl') || 60,
          limit: configService.get<number>('throttle.limit') || 100,
        }],
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: true,
    }),
    ScheduleModule.forRoot(),
    HttpModule,
    TerminusModule,
    MetricsModule,
    KafkaModule,
    LedgerModule,
    
    // DDD CQRS Modules
    TransactionModule,
    AccountModule,
    TransactionEntryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {}
