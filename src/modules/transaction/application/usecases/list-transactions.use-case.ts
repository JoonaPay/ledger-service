import { Injectable } from "@nestjs/common";
import { TransactionEntity } from "@modules/transaction/domain/entities/transaction.entity";
import { TransactionRepository } from "@modules/transaction/infrastructure/repositories/transaction.repository";

@Injectable()
export class ListTransactionsUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(): Promise<TransactionEntity[]> {
    return this.repository.findAll();
  }
}