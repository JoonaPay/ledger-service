import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { Repositories } from "@modules/transaction/infrastructure/repositories";
import { Queries } from "@modules/transaction/application/queries";
import { Mappers } from "@modules/transaction/infrastructure/mappers";
import { UseCases } from "@modules/transaction/application/domain/usecases";
import { Controllers } from "@modules/transaction/application/controllers";
import { CommandHandlers } from "@modules/transaction/application/commands";
import { OrmEntities } from "@modules/transaction/infrastructure/orm-entities";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Services } from "@modules/transaction/application/domain/services";

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
export class TransactionModule {}