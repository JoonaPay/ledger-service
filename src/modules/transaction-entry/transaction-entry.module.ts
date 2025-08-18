import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { Repositories } from "@modules/transaction-entry/infrastructure/repositories";
import { Queries } from "@modules/transaction-entry/application/queries";
import { Mappers } from "@modules/transaction-entry/infrastructure/mappers";
import { UseCases } from "@modules/transaction-entry/application/domain/usecases";
import { Controllers } from "@modules/transaction-entry/application/controllers";
import { CommandHandlers } from "@modules/transaction-entry/application/commands";
import { OrmEntities } from "@modules/transaction-entry/infrastructure/orm-entities";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Services } from "@modules/transaction-entry/application/domain/services";

@Module({
  imports: [TypeOrmModule.forFeature([...OrmEntities]), CqrsModule],
  providers: [
    ...CommandHandlers,
    ...Queries,
    ...Repositories,
    ...Mappers,
    ...UseCases,
    ...Services,
  ],
  controllers: [...Controllers],
})
export class TransactionEntryModule {}