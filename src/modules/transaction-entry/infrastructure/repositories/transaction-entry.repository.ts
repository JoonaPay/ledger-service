import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TransactionEntryMapper } from "@modules/transaction-entry/infrastructure/mappers/transaction-entry.mapper";
import { TransactionEntryOrmEntity } from "@modules/transaction-entry/infrastructure/orm-entities/transaction-entry.orm-entity";
import { TransactionEntryEntity } from "@modules/transaction-entry/domain/entities/transaction-entry.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TransactionEntryRepository {
  constructor(
    @InjectRepository(TransactionEntryOrmEntity)
    private readonly repository: Repository<TransactionEntryOrmEntity>,
    private readonly mapper: TransactionEntryMapper,
  ) {}

  async create(entity: TransactionEntryEntity): Promise<TransactionEntryEntity> {
    const ormEntity = this.mapper.toOrm(entity);
    const savedOrmEntity = await this.repository.save(ormEntity);
    return this.mapper.toDomain(savedOrmEntity);
  }

  async findById(id: string): Promise<TransactionEntryEntity | null> {
    const ormEntity = await this.repository.findOne({
      where: { id },
    });
    if (!ormEntity) {
      return null;
    }
    return this.mapper.toDomain(ormEntity);
  }

  async findAll(): Promise<TransactionEntryEntity[]> {
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
    entity: TransactionEntryEntity,
  ): Promise<TransactionEntryEntity> {
    const ormEntity = this.mapper.toOrm(entity);
    await this.repository.update(id, ormEntity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}