import { Repository } from "typeorm";
import { TransactionEntryMapper } from "@modules/transaction-entry/infrastructure/mappers/transaction-entry.mapper";
import { TransactionEntryOrmEntity } from "@modules/transaction-entry/infrastructure/orm-entities/transaction-entry.orm-entity";
import { TransactionEntryEntity } from "@modules/transaction-entry/domain/entities/transaction-entry.entity";
export declare class TransactionEntryRepository {
    private readonly repository;
    private readonly mapper;
    constructor(repository: Repository<TransactionEntryOrmEntity>, mapper: TransactionEntryMapper);
    create(entity: TransactionEntryEntity): Promise<TransactionEntryEntity>;
    findById(id: string): Promise<TransactionEntryEntity | null>;
    findAll(): Promise<TransactionEntryEntity[]>;
    update(id: string, entity: TransactionEntryEntity): Promise<TransactionEntryEntity>;
    delete(id: string): Promise<void>;
}
