import { Repository } from "typeorm";
import { TransactionMapper } from "@modules/transaction/infrastructure/mappers/transaction.mapper";
import { TransactionOrmEntity } from "@modules/transaction/infrastructure/orm-entities/transaction.orm-entity";
import { TransactionEntity } from "@modules/transaction/domain/entities/transaction.entity";
export declare class TransactionRepository {
    private readonly repository;
    private readonly mapper;
    constructor(repository: Repository<TransactionOrmEntity>, mapper: TransactionMapper);
    create(entity: TransactionEntity): Promise<TransactionEntity>;
    findById(id: string): Promise<TransactionEntity | null>;
    findAll(): Promise<TransactionEntity[]>;
    update(id: string, entity: TransactionEntity): Promise<TransactionEntity>;
    delete(id: string): Promise<void>;
}
