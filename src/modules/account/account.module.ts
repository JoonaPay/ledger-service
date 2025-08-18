import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { Repositories } from "@modules/account/infrastructure/repositories";
import { Queries } from "@modules/account/application/queries";
import { Mappers } from "@modules/account/infrastructure/mappers";
import { UseCases } from "@modules/account/application/domain/usecases";
import { Controllers } from "@modules/account/application/controllers";
import { CommandHandlers } from "@modules/account/application/commands";
import { OrmEntities } from "@modules/account/infrastructure/orm-entities";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Services } from "@modules/account/application/domain/services";

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
export class AccountModule {}