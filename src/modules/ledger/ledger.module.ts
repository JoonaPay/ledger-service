import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { HttpModule } from "@nestjs/axios";
import { Repositories } from "@modules/ledger/infrastructure/repositories";
import { Queries } from "@modules/ledger/application/queries";
import { Mappers } from "@modules/ledger/infrastructure/mappers";
import { UseCases } from "@modules/ledger/application/domain/usecases";
import { Controllers } from "@modules/ledger/application/controllers";
import { CommandHandlers } from "@modules/ledger/application/commands";
import { OrmEntities } from "@modules/ledger/infrastructure/orm-entities";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Services } from "@modules/ledger/application/domain/services";
import { BlnkFinanceService } from "./infrastructure/external/blnkfinance.service";
import { IdentityEventHandler } from "./application/handlers/identity-event.handler";
import { MetricsModule } from "@shared/metrics/metrics.module";
import { KafkaModule } from "@shared/kafka/kafka.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([...OrmEntities]), 
    CqrsModule,
    HttpModule,
    MetricsModule,
    KafkaModule,
  ],
  providers: [
    ...CommandHandlers,
    ...Queries,
    ...Repositories,
    ...Mappers,
    ...UseCases,
    ...Services,
    BlnkFinanceService,
    IdentityEventHandler,
  ],
  controllers: [...Controllers],
  exports: [
    ...Services,
    BlnkFinanceService,
  ],
})
export class LedgerModule {}