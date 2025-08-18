import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TransactionMapper } from "@modules/transaction/infrastructure/mappers/transaction.mapper";
import { TransactionOrmEntity } from "@modules/transaction/infrastructure/orm-entities/transaction.orm-entity";
import { TransactionEntity } from "@modules/transaction/domain/entities/transaction.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectRepository(TransactionOrmEntity)
    private readonly repository: Repository<TransactionOrmEntity>,
    private readonly mapper: TransactionMapper,
  ) {}

  async create(entity: TransactionEntity): Promise<TransactionEntity> {
    const ormEntity = this.mapper.toOrm(entity);
    const savedOrmEntity = await this.repository.save(ormEntity);
    return this.mapper.toDomain(savedOrmEntity);
  }

  async findById(id: string): Promise<TransactionEntity | null> {
    const ormEntity = await this.repository.findOne({
      where: { id },
    });
    if (!ormEntity) {
      return null;
    }
    return this.mapper.toDomain(ormEntity);
  }

  async findAll(): Promise<TransactionEntity[]> {
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
    entity: TransactionEntity,
  ): Promise<TransactionEntity> {
    const ormEntity = this.mapper.toOrm(entity);
    await this.repository.update(id, ormEntity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}