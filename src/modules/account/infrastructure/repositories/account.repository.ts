import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AccountMapper } from "@modules/account/infrastructure/mappers/account.mapper";
import { AccountOrmEntity } from "@modules/account/infrastructure/orm-entities/account.orm-entity";
import { AccountEntity } from "@modules/account/domain/entities/account.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AccountRepository {
  constructor(
    @InjectRepository(AccountOrmEntity)
    private readonly repository: Repository<AccountOrmEntity>,
    private readonly mapper: AccountMapper,
  ) {}

  async create(entity: AccountEntity): Promise<AccountEntity> {
    const ormEntity = this.mapper.toOrm(entity);
    const savedOrmEntity = await this.repository.save(ormEntity);
    return this.mapper.toDomain(savedOrmEntity);
  }

  async findById(id: string): Promise<AccountEntity | null> {
    const ormEntity = await this.repository.findOne({
      where: { id },
    });
    if (!ormEntity) {
      return null;
    }
    return this.mapper.toDomain(ormEntity);
  }

  async findAll(): Promise<AccountEntity[]> {
    const ormEntities = await this.repository.find();
    if (!ormEntities) {
      return [];
    }
    return ormEntities.map((ormEntity) =>
      this.mapper.toDomain(ormEntity),
    );
  }

  async update(
    id: string,
    entity: AccountEntity,
  ): Promise<AccountEntity> {
    const ormEntity = this.mapper.toOrm(entity);
    await this.repository.update(id, ormEntity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}